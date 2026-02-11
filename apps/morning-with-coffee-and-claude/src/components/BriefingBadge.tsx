import type { BriefingSlot } from '@/lib/types'

const SLOT_CONFIG: Record<BriefingSlot, { label: string; icon: string; className: string }> = {
  morning: {
    label: 'Morning',
    icon: '☀️',
    className: 'bg-amber-100 text-amber-800',
  },
  midday: {
    label: 'Mid-day',
    icon: '🌤️',
    className: 'bg-sky-100 text-sky-800',
  },
  evening: {
    label: 'Evening',
    icon: '🌙',
    className: 'bg-indigo-100 text-indigo-800',
  },
}

interface BriefingBadgeProps {
  slot: BriefingSlot
}

export default function BriefingBadge({ slot }: BriefingBadgeProps) {
  const config = SLOT_CONFIG[slot]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  )
}
