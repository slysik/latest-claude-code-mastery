interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'orange' | 'blue' | 'green'
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default:
    'bg-anthropic-light-gray/50 text-anthropic-dark',
  orange:
    'bg-anthropic-orange/15 text-anthropic-orange',
  blue:
    'bg-anthropic-blue/15 text-anthropic-blue',
  green:
    'bg-anthropic-green/15 text-anthropic-green',
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {children}
    </span>
  )
}
