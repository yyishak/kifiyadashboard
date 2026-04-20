"use client"

import { useEffect, useRef, useState } from "react"

import { EthiopiaMapView } from "@/components/dashboard/EthiopiaMapView"
import { ImageTicker } from "@/components/dashboard/ImageTicker"
import { tickerImages } from "@/1/tickerImages"

type Props = {
  valuesByRegion?: Record<string, number>
}

export const MapPanel = ({ valuesByRegion }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    onChange()
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        return
      }

      const el = containerRef.current ?? document.documentElement
      await el.requestFullscreen()
    } catch {
      // Ignore if browser blocks fullscreen (not user-initiated, etc.)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-3 px-5 pt-3 md:px-8 md:pt-4">
          <div />

          <div className="pointer-events-auto text-right">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={toggleFullscreen}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur transition hover:border-white/25 hover:bg-white/15"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? "⤡" : "⤢"}
              </button>

              <div className="text-sm font-semibold tracking-wide text-white/90">
                Total MSME&apos;s
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[56svh] max-h-[520px] md:h-[62svh] md:max-h-[620px]">
        <EthiopiaMapView valuesByRegion={valuesByRegion} />
      </div>

      <div className="mt-4 px-5 md:px-8">
        <ImageTicker images={tickerImages} alt="Map ticker images" className="mx-auto max-w-6xl" />
      </div>
    </div>
  )
}

