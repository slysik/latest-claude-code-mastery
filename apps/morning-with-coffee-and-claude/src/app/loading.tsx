export default function Loading() {
  return (
    <main className="min-h-screen bg-anthropic-light px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="h-10 w-80 animate-pulse rounded-lg bg-anthropic-light-gray/50" />
          <div className="h-5 w-56 animate-pulse rounded bg-anthropic-light-gray/40" />
        </div>

        {/* Top Stories section skeleton */}
        <div className="space-y-4">
          <div className="h-7 w-40 animate-pulse rounded bg-anthropic-light-gray/50" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-lg bg-anthropic-light-gray/30 border border-anthropic-light-gray"
              />
            ))}
          </div>
        </div>

        {/* Sentiment + Tips row skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 animate-pulse rounded-lg bg-anthropic-light-gray/30 border border-anthropic-light-gray" />
          <div className="h-64 animate-pulse rounded-lg bg-anthropic-light-gray/30 border border-anthropic-light-gray" />
        </div>

        {/* Videos section skeleton */}
        <div className="space-y-4">
          <div className="h-7 w-36 animate-pulse rounded bg-anthropic-light-gray/50" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-lg bg-anthropic-light-gray/30 border border-anthropic-light-gray"
              />
            ))}
          </div>
        </div>

        {/* Ecosystem section skeleton */}
        <div className="space-y-4">
          <div className="h-7 w-48 animate-pulse rounded bg-anthropic-light-gray/50" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-lg bg-anthropic-light-gray/30 border border-anthropic-light-gray"
              />
            ))}
          </div>
        </div>

        {/* Community Pulse section skeleton */}
        <div className="h-52 animate-pulse rounded-lg bg-anthropic-light-gray/30 border border-anthropic-light-gray" />

        {/* Footer skeleton */}
        <div className="h-16 animate-pulse rounded-lg bg-anthropic-light-gray/20" />
      </div>
    </main>
  )
}
