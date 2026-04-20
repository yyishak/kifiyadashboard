"use client"

import { useEffect, useState } from "react"

type Props = {
  className?: string
}

export const FullscreenToggle = ({ className }: Props) => {
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
      await document.documentElement.requestFullscreen()
    } catch {
      // Ignore if browser blocks fullscreen (not user-initiated, etc.)
    }
  }

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      className={[
        "grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur transition hover:border-white/25 hover:bg-white/15",
        className ?? "",
      ].join(" ")}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? "⤡" : "⤢"}
    </button>
  )
}

