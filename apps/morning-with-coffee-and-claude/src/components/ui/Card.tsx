interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-anthropic-light-gray/30 border border-anthropic-light-gray rounded-lg p-6 ${className}`}
    >
      {children}
    </div>
  )
}
