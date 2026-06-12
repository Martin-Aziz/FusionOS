import type { CompatibilityLevel } from '../types';

const CONFIG: Record<CompatibilityLevel, { label: string; className: string }> = {
  platinum: { label: 'Platinum', className: 'badge-platinum' },
  gold:     { label: 'Gold',     className: 'badge-gold' },
  silver:   { label: 'Silver',   className: 'badge-silver' },
  bronze:   { label: 'Bronze',   className: 'badge-bronze' },
  experimental: { label: 'Experimental', className: 'badge-experimental' },
  unsupported:  { label: 'Unsupported',  className: 'badge-unsupported' },
  unknown:      { label: 'Unknown',      className: 'badge-unknown' }
};

export default function CompatibilityBadge({ level }: { level: CompatibilityLevel }) {
  const { label, className } = CONFIG[level] ?? CONFIG.unknown;
  return <span className={className}>{label}</span>;
}
