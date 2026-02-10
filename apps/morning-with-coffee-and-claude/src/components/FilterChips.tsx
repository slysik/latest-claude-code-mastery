'use client'

interface FilterChipsProps {
  options: string[]
  selected: string
  onChange: (value: string) => void
}

export default function FilterChips({ options, selected, onChange }: FilterChipsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 -mb-2"
      role="tablist"
      aria-label="Filter options"
    >
      {options.map((option) => {
        const isSelected = option === selected
        return (
          <button
            key={option}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(option)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isSelected
                ? 'bg-anthropic-orange text-white'
                : 'bg-anthropic-light-gray/50 text-anthropic-dark hover:bg-anthropic-light-gray'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
