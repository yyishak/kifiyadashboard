export const formatCompact = (value: number) => {
  const abs = Math.abs(value)

  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return `${Math.round(value)}`
}

export const formatETB = (value: number) => `ETB ${formatCompact(value)}`

