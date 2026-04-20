export const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const colorRamp = (tRaw: number) => {
  const t = clamp01(tRaw)

  // Deep teal -> orange (dashboard accent), with a mid stop for contrast
  const c0 = [6, 43, 47]
  const c1 = [15, 102, 112]
  const c2 = [242, 139, 44]

  const w = t < 0.55 ? t / 0.55 : (t - 0.55) / 0.45
  const from = t < 0.55 ? c0 : c1
  const to = t < 0.55 ? c1 : c2

  return [
    Math.round(lerp(from[0], to[0], w)),
    Math.round(lerp(from[1], to[1], w)),
    Math.round(lerp(from[2], to[2], w)),
    190,
  ] as const
}

