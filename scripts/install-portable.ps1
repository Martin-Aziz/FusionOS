param(
  [string]$InstallDir = "$HOME/fusionos",
  [switch]$AllowOnlinePull,
  [int]$MinDiskMb = 4096,
  [int]$HealthTimeoutSeconds = 90,
  [int]$HealthIntervalSeconds = 3
)

$ErrorActionPreference = 'Stop'

$packageRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$payloadDir = Join-Path $packageRoot 'payload'
$imagesDir = Join-Path $packageRoot 'images'
$expectedImages = @(
  'fusionos-app.tar',
  'postgres-15-alpine.tar',
  'redis-7-alpine.tar',
  'nginx-1.27-alpine.tar'
)

function Write-Log {
  param([string]$Message)
  Write-Host "[install-portable] $Message"
}

function Invoke-Compose {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)

  Push-Location $InstallDir
  try {
    docker compose -f docker-compose.yml --env-file .env @Args
  } finally {
    Pop-Location
  }
}

function Ensure-WritableInstallDir {
  New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
  $probeFile = Join-Path $InstallDir '.fusionos_write_probe'
  Set-Content -Path $probeFile -Value 'probe' -NoNewline
  Remove-Item -Path $probeFile -Force
}

function Test-PortInUse {
  param([int]$Port)

  $listener = $null
  try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
    $listener.Start()
    return $false
  } catch {
    return $true
  } finally {
    if ($null -ne $listener) {
      $listener.Stop()
    }
  }
}

function Assert-PortAvailable {
  param(
    [int]$Port,
    [string]$Label
  )

  if (Test-PortInUse -Port $Port) {
    throw "$Label port $Port is already in use. Update .env or free the port."
  }
}

function Get-EnvValue {
  param(
    [string]$Key,
    [string]$DefaultValue = ''
  )

  $pattern = "^{0}=" -f [regex]::Escape($Key)
  $line = Get-Content $envPath | Where-Object { $_ -match $pattern } | Select-Object -Last 1
  if ($null -eq $line) {
    return $DefaultValue
  }

  $value = $line.Substring($Key.Length + 1).Trim()
  return $value.Trim('"')
}

function Set-EnvValue {
  param(
    [string]$Key,
    [string]$Value
  )

  $pattern = "^{0}=" -f [regex]::Escape($Key)
  $lines = Get-Content $envPath
  $found = $false
  $updated = foreach ($line in $lines) {
    if ($line -match $pattern) {
      $found = $true
      "{0}={1}" -f $Key, $Value
    } else {
      $line
    }
  }

  if (-not $found) {
    $updated += "{0}={1}" -f $Key, $Value
  }

  Set-Content -Path $envPath -Value $updated
}

function Ensure-DeviceTokenSalt {
  $salt = Get-EnvValue -Key 'DEVICE_TOKEN_SALT'
  if ([string]::IsNullOrWhiteSpace($salt) -or $salt.Contains('replace-with') -or $salt.Length -lt 32) {
    $bytes = New-Object byte[] 48
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $generated = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '').Replace('/', '')
    Set-EnvValue -Key 'DEVICE_TOKEN_SALT' -Value $generated
    Write-Log 'Generated a secure DEVICE_TOKEN_SALT in .env'
  }
}

function Verify-Checksums {
  $checksumFile = Join-Path $packageRoot 'metadata/SHA256SUMS'
  if (-not (Test-Path $checksumFile)) {
    Write-Log 'Warning: checksum file not found at metadata/SHA256SUMS; skipping integrity verification.'
    return
  }

  $checksumLines = Get-Content $checksumFile | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
  foreach ($line in $checksumLines) {
    $parts = $line -split '\s+', 2
    if ($parts.Count -lt 2) {
      throw "Invalid checksum entry: $line"
    }

    $expectedHash = $parts[0].ToLowerInvariant()
    $relativePath = $parts[1].Trim().TrimStart('.')
    $relativePath = $relativePath.TrimStart('/', '\\')
    $filePath = Join-Path $packageRoot ($relativePath.Replace('/', [System.IO.Path]::DirectorySeparatorChar))

    if (-not (Test-Path $filePath)) {
      throw "Checksum target file not found: $relativePath"
    }

    $actualHash = (Get-FileHash -Path $filePath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actualHash -ne $expectedHash) {
      throw "Checksum mismatch for $relativePath"
    }
  }
}

function Ensure-FreeDiskSpace {
  $resolvedInstallPath = (Resolve-Path $InstallDir).Path
  $driveRoot = [System.IO.Path]::GetPathRoot($resolvedInstallPath)
  $driveName = $driveRoot.TrimEnd('\\').TrimEnd(':')
  $drive = Get-PSDrive -Name $driveName -ErrorAction Stop
  $requiredBytes = [int64]$MinDiskMb * 1MB
  if ($drive.Free -lt $requiredBytes) {
    throw "Insufficient free disk space on drive $driveName. Need at least ${MinDiskMb}MB free."
  }
}

function Wait-ForAppHealthy {
  $deadline = (Get-Date).AddSeconds($HealthTimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    $containerId = ((Invoke-Compose ps -q app) | Out-String).Trim()
    if (-not [string]::IsNullOrWhiteSpace($containerId)) {
      $status = (docker inspect --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" $containerId 2>$null | Out-String).Trim()
      if ($status -eq 'healthy') {
        return $true
      }
    }

    Start-Sleep -Seconds $HealthIntervalSeconds
  }

  return $false
}

function Rollback-Stack {
  Write-Log 'Rolling back stack startup'
  try {
    Invoke-Compose down | Out-Null
  } catch {
    Write-Log 'Rollback encountered an error and was ignored.'
  }
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw 'Missing required command: docker'
}

try {
  docker info | Out-Null
} catch {
  throw 'Docker daemon is not running. Start Docker and retry.'
}

try {
  docker compose version | Out-Null
} catch {
  throw 'Docker Compose v2 is required (docker compose ...).'
}

if (-not (Test-Path $payloadDir) -or -not (Test-Path $imagesDir)) {
  throw 'Invalid package layout. Expected payload/ and images/ alongside this script.'
}

Write-Log "Installing to $InstallDir"
Ensure-WritableInstallDir
Get-ChildItem -Path $payloadDir -Force | ForEach-Object {
  Copy-Item $_.FullName $InstallDir -Recurse -Force
}

$envPath = Join-Path $InstallDir '.env'
if (-not (Test-Path $envPath)) {
  Copy-Item (Join-Path $InstallDir '.env.example') $envPath -Force
}

Ensure-DeviceTokenSalt
Ensure-FreeDiskSpace

$appPort = [int](Get-EnvValue -Key 'PORT' -DefaultValue '4000')
$postgresPort = [int](Get-EnvValue -Key 'POSTGRES_PORT' -DefaultValue '5432')
$redisPort = [int](Get-EnvValue -Key 'REDIS_PORT' -DefaultValue '6379')
$proxyPort = [int](Get-EnvValue -Key 'PROXY_PORT' -DefaultValue '8080')

Assert-PortAvailable -Port $appPort -Label 'App'
Assert-PortAvailable -Port $postgresPort -Label 'Postgres'
Assert-PortAvailable -Port $redisPort -Label 'Redis'
Assert-PortAvailable -Port $proxyPort -Label 'Reverse proxy'

Verify-Checksums

Write-Log 'Loading offline images'
$availableImages = @()
$missingImages = @()
foreach ($imageName in $expectedImages) {
  $imagePath = Join-Path $imagesDir $imageName
  if ((Test-Path $imagePath) -and (Get-Item $imagePath).Length -gt 0) {
    $availableImages += $imagePath
  } else {
    $missingImages += $imageName
  }
}

if ($missingImages.Count -gt 0) {
  if ($AllowOnlinePull) {
    Write-Log "Missing offline image files: $($missingImages -join ', '). Continuing with online pull enabled."
  } else {
    throw "Missing offline image files: $($missingImages -join ', '). Rebuild package with Docker running, or rerun installer with -AllowOnlinePull."
  }
}

foreach ($imagePath in $availableImages) {
  $imageName = Split-Path -Leaf $imagePath
  Write-Log "Loading $imageName"
  docker load -i $imagePath | Out-Host
}

Write-Log 'Starting services'
Invoke-Compose up -d | Out-Host

Write-Log 'Waiting for app health status'
if (-not (Wait-ForAppHealthy)) {
  Rollback-Stack
  throw 'Timed out waiting for app health check. Stack was rolled back.'
}

Write-Log 'Install complete'
Write-Log "Health check URL: http://localhost:$appPort/health"
Write-Log "Manage stack from $InstallDir with: docker compose ps"
