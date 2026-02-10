'use client'

import type { FetchedItem } from '@/lib/types'

interface YouTubeCarouselProps {
  videos: FetchedItem[]
}

function formatCount(value: number, label: string): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ${label}`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K ${label}`
  return `${value} ${label}`
}

export default function YouTubeCarousel({ videos }: YouTubeCarouselProps) {
  if (videos.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-body text-anthropic-dark/60 italic">
          Video recommendations coming soon.
        </p>
      </div>
    )
  }

  return (
    <div
      className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mb-4"
      role="list"
      aria-label="YouTube video recommendations"
    >
      {videos.map((video) => (
        <a
          key={video.url}
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          role="listitem"
          className="snap-start shrink-0 w-72 bg-anthropic-light-gray/30 border border-anthropic-light-gray rounded-lg overflow-hidden hover:border-anthropic-mid-gray transition-colors group"
        >
          {/* Thumbnail */}
          <div className="aspect-video bg-anthropic-light-gray relative overflow-hidden">
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-anthropic-mid-gray">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
            )}
          </div>
          {/* Info */}
          <div className="p-4 space-y-1">
            <h3 className="font-heading text-small font-medium text-anthropic-dark line-clamp-2 group-hover:text-anthropic-blue transition-colors">
              {video.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-anthropic-mid-gray">
              {video.author && <span className="font-body">{video.author}</span>}
              {video.author && <span aria-hidden="true">&middot;</span>}
              {(video.rawMetrics.likes ?? 0) > 0 && (
                <>
                  <span className="font-body">{formatCount(video.rawMetrics.likes, 'likes')}</span>
                  <span aria-hidden="true">&middot;</span>
                </>
              )}
              <span className="font-body">{formatCount(video.rawMetrics.views ?? 0, 'views')}</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
