interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  color = '#d97757',
}: SparklineProps) {
  if (data.length < 3) {
    return (
      <span className="text-xs text-anthropic-mid-gray italic">
        Not enough data
      </span>
    )
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const padding = 2
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2

  const points = data
    .map((value, i) => {
      const x = padding + (i / (data.length - 1)) * innerWidth
      const y = padding + innerHeight - ((value - min) / range) * innerHeight
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block"
      role="img"
      aria-label="Sparkline chart"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
