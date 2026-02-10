interface SectionErrorFallbackProps {
  section?: string
}

export function SectionErrorFallback({
  section,
}: SectionErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center py-12 text-center">
      <p className="text-sm text-anthropic-mid-gray">
        {section
          ? `${section} temporarily unavailable`
          : 'Section temporarily unavailable'}
      </p>
    </div>
  )
}
