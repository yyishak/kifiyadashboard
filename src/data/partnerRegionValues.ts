import type { PartnerId } from "@/data/partnerKpis"
import { regionValues as baseRegionValues } from "@/data/regionValues"

const scaleValues = (multiplier: number) => {
  const out: Record<string, number> = {}

  for (const [key, value] of Object.entries(baseRegionValues)) {
    out[key] = Math.max(0, Math.round(value * multiplier))
  }

  return out
}

export const partnerRegionValues: Record<PartnerId, Record<string, number>> = {
  partner_1: baseRegionValues,
  partner_2: scaleValues(0.72),
  partner_3: scaleValues(0.55),
  partner_4: scaleValues(0.43),
  partner_5: scaleValues(0.35),
  partner_6: scaleValues(0.28),
}

