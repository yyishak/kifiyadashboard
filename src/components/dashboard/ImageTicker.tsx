"use client"

import Image from "next/image"
import type { StaticImageData } from "next/image"

type Props = {
  images: StaticImageData[]
  alt: string
  className?: string
  speedSeconds?: number
}

export const ImageTicker = ({ images, alt, className, speedSeconds = 22 }: Props) => {
  return (
    <div
      className={[
        "relative h-[106px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#02404F]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ["--ticker-duration" as never]: `${speedSeconds}s` }}
    >
      <div className="ticker-track flex w-max">
        {images.map((src, idx) => (
          <div key={`a-${idx}`} className="ticker-item">
            <Image
              src={src}
              alt={idx === 0 ? alt : ""}
              width={src.width}
              height={src.height}
              className="h-[106px] w-auto select-none"
              priority
            />
          </div>
        ))}
        {images.map((src, idx) => (
          <div key={`b-${idx}`} className="ticker-item" aria-hidden="true">
            <Image
              src={src}
              alt=""
              width={src.width}
              height={src.height}
              className="h-[106px] w-auto select-none"
              priority
            />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#02404F] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#02404F] to-transparent" />
    </div>
  )
}

