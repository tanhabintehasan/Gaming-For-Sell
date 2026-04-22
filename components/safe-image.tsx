'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SafeImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  containerClassName?: string
  priority?: boolean
}

export function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  containerClassName,
  priority,
}: SafeImageProps) {
  const [error, setError] = useState(false)

  if (error || !src) {
    const initial = alt?.charAt(0) || '?'
    const hue = initial.charCodeAt(0) % 360

    if (fill) {
      return (
        <div
          className={cn(
            'w-full h-full flex items-center justify-center',
            containerClassName
          )}
          style={{
            background: `linear-gradient(135deg, hsl(${hue}, 60%, 15%), hsl(${hue}, 50%, 8%))`,
          }}
        >
          <span
            className="text-2xl font-bold opacity-40"
            style={{ color: `hsl(${hue}, 70%, 60%)` }}
          >
            {initial}
          </span>
        </div>
      )
    }

    return (
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden',
          containerClassName
        )}
        style={{
          width: width || '100%',
          height: height || '100%',
          background: `linear-gradient(135deg, hsl(${hue}, 60%, 15%), hsl(${hue}, 50%, 8%))`,
        }}
      >
        <span
          className="text-lg font-bold opacity-40"
          style={{ color: `hsl(${hue}, 70%, 60%)` }}
        >
          {initial}
        </span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      priority={priority}
      unoptimized
      onError={() => setError(true)}
    />
  )
}
