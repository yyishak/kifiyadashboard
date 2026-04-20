export const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const colorRamp = (tRaw: number) => {
  const t = clamp01(tRaw)

  // Dark -> light green ramp (choropleth)
  const c0 = [10, 45, 22]    // deep green
  const c1 = [34, 139, 74]   // mid green
  const c2 = [170, 240, 200] // light green

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

