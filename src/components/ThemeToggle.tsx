"use client"

import { useEffect, useState } from "react"

type Theme = "dark" | "light"

type Props = {
  className?: string
}

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "dark"
  const stored = window.localStorage.getItem("theme")
  if (stored === "light" || stored === "dark") return stored
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light"
}

export const ThemeToggle = ({ className }: Props) => {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    const t = getInitialTheme()
    setTheme(t)
    document.documentElement.dataset.theme = t
  }, [])

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark"
    setTheme(next)
    document.documentElement.dataset.theme = next
    window.localStorage.setItem("theme", next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={[
        "grid h-9 w-9 place-items-center rounded-full border border-[color:var(--card-border)] bg-[color:var(--surface-2)] text-[color:var(--fg)] shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur transition hover:bg-[color:var(--surface-3)]",
        className ?? "",
      ].join(" ")}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light theme" : "Dark theme"}
    >
      {theme === "dark" ? "☀" : "🌙"}
    </button>
  )
}

