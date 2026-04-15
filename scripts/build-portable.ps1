$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$version = node -p "require('$($root.Path.Replace("\","\\"))/package.json').version"
$buildRoot = Join-Path $root 'build/portable'
$stageDir = Join-Path $buildRoot "fusionos-$version"
$releaseDir = Join-Path $buildRoot 'releases'
$appImage = "fusionos/app:$version"
$skipImages = $env:SKIP_IMAGES -eq '1'
$enforceOffline = if ([string]::IsNullOrEmpty($env:ENFORCE_OFFLINE)) { $true } else { $env:ENFORCE_OFFLINE -ne '0' }
$expectedImages = @(
  'fusionos-app.tar',
  'postgres-15-alpine.tar',
  'redis-7-alpine.tar',
  'nginx-1.27-alpine.tar'
)

function Write-Log {
  param([string]$Message)
  Write-Host "[build-portable] $Message"
}

function Require-Command {
  param([string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $Name"
  }
}

Write-Log 'Checking dependencies'
Require-Command 'node'

if ($skipImages -and $enforceOffline) {
  throw 'SKIP_IMAGES=1 is incompatible with ENFORCE_OFFLINE=1. Set ENFORCE_OFFLINE=0 only for payload-only development builds.'
}

if (-not $skipImages) {
  Require-Command 'docker'
  try {
    docker info | Out-Null
  } catch {
    throw 'Docker daemon is not running. Start Docker and retry.'
  }
}

$serverJs = Join-Path $root 'backend/dist/backend/src/server.js'
if (-not (Test-Path $serverJs)) {
  throw 'backend build output not found. Run npm run build first.'
}

Write-Log 'Preparing staging directory'
if (Test-Path $stageDir) {
  Remove-Item -Recurse -Force $stageDir
}
New-Item -ItemType Directory -Force -Path (Join-Path $stageDir 'payload') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $stageDir 'images') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $stageDir 'metadata') | Out-Null
New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null

if ($skipImages) {
  Write-Log 'SKIP_IMAGES=1 set: skipping Docker image build and save'
} else {
  Write-Log "Building offline app image $appImage"
  docker build -f (Join-Path $root 'backend/Dockerfile') -t $appImage $root | Out-Host

  Write-Log 'Pulling dependency images'
  docker pull postgres:15-alpine | Out-Host
  docker pull redis:7-alpine | Out-Host
  docker pull nginx:1.27-alpine | Out-Host

  Write-Log 'Saving images for offline use'
  docker save $appImage -o (Join-Path $stageDir 'images/fusionos-app.tar') | Out-Host
  docker save postgres:15-alpine -o (Join-Path $stageDir 'images/postgres-15-alpine.tar') | Out-Host
  docker save redis:7-alpine -o (Join-Path $stageDir 'images/redis-7-alpine.tar') | Out-Host
  docker save nginx:1.27-alpine -o (Join-Path $stageDir 'images/nginx-1.27-alpine.tar') | Out-Host

  foreach ($image in $expectedImages) {
    $imagePath = Join-Path $stageDir "images/$image"
    if (-not (Test-Path $imagePath) -or (Get-Item $imagePath).Length -eq 0) {
      throw "Offline artifact verification failed: missing or empty image file $imagePath"
    }
  }
}

Write-Log 'Copying payload files'
Copy-Item (Join-Path $root 'docker-compose.usb.yml') (Join-Path $stageDir 'payload/docker-compose.yml') -Force
Get-Content (Join-Path $root '.env.usb.example') |
  ForEach-Object {
    if ($_ -match '^FUSIONOS_APP_IMAGE=') {
      "FUSIONOS_APP_IMAGE=$appImage"
    } else {
      $_
    }
  } | Set-Content (Join-Path $stageDir 'payload/.env.example')
Copy-Item (Join-Path $root 'infra/nginx/default.conf') (Join-Path $stageDir 'payload/default.conf') -Force
Copy-Item (Join-Path $root 'scripts/install-portable.sh') (Join-Path $stageDir 'payload/install.sh') -Force
Copy-Item (Join-Path $root 'scripts/install-portable.ps1') (Join-Path $stageDir 'payload/install.ps1') -Force
Copy-Item (Join-Path $root 'docs/INSTALLATION.md') (Join-Path $stageDir 'payload/INSTALLATION.md') -Force
Copy-Item (Join-Path $root 'README.md') (Join-Path $stageDir 'payload/README.md') -Force

$manifest = @{
  name = 'fusionos'
  version = $version
  createdAt = (Get-Date).ToUniversalTime().ToString('o')
  appImage = $appImage
  enforceOffline = $enforceOffline
  offlineReady = (-not $skipImages)
  skipImages = $skipImages
  images = @(
    'fusionos-app.tar',
    'postgres-15-alpine.tar',
    'redis-7-alpine.tar',
    'nginx-1.27-alpine.tar'
  )
} | ConvertTo-Json -Depth 5
$manifest | Set-Content (Join-Path $stageDir 'metadata/manifest.json')

Write-Log 'Generating checksums'
$checksumFile = Join-Path $stageDir 'metadata/SHA256SUMS'
$files = Get-ChildItem -Path $stageDir -File -Recurse | Where-Object { $_.FullName -ne $checksumFile } | Sort-Object FullName
$checksums = foreach ($file in $files) {
  $hash = Get-FileHash -Algorithm SHA256 -Path $file.FullName
  $relativePath = ".{0}" -f $file.FullName.Substring($stageDir.Length).Replace('\\', '/')
  "{0}  {1}" -f $hash.Hash.ToLower(), $relativePath
}
$checksums | Set-Content $checksumFile

$zipPath = Join-Path $releaseDir "fusionos-$version-usb.zip"
if (Test-Path $zipPath) {
  Remove-Item -Force $zipPath
}

Write-Log "Creating archive $zipPath"
Compress-Archive -Path $stageDir -DestinationPath $zipPath -CompressionLevel Optimal

$startHere = @"
FusionOS USB Install Package

File to copy:
- fusionos-$version-usb.zip

How to install on target machine:
1. Copy the archive to your USB drive.
2. Extract the archive on the target machine.
3. Open payload/INSTALLATION.md in the extracted folder.
4. Run payload/install.sh (Linux) or payload/install.ps1 (Windows).

If you need a payload-only development bundle, run:
`$env:ENFORCE_OFFLINE='0'; `$env:SKIP_IMAGES='1'; ./scripts/build-portable.ps1
"@
$startHere | Set-Content (Join-Path $releaseDir 'USB-START-HERE.txt')

Write-Log 'Done'
Write-Log "Archive: $zipPath"
Write-Log "Stage dir: $stageDir"
