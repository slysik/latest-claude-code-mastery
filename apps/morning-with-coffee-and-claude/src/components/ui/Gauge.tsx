interface GaugeProps {
  value: number
  label?: string
  color?: string
}

export function Gauge({
  value,
  label,
  color = '#d97757',
}: GaugeProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const size = 80
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label={`${label ?? 'Gauge'}: ${clamped}%`}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e8e6dc"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-sm font-medium text-anthropic-dark">
        {clamped}%
      </span>
      {label && (
        <span className="text-xs text-anthropic-mid-gray">{label}</span>
      )}
    </div>
  )
}
