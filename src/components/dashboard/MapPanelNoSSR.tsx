"use client"

import dynamic from "next/dynamic"

type Props = {
  valuesByRegion?: Record<string, number>
  mapTitle?: string
  mapTintHex?: string
}

const MapPanelInner = dynamic(
  () => import("@/components/dashboard/MapPanel").then((m) => m.MapPanel),
  { ssr: false }
)

export const MapPanelNoSSR = (props: Props) => {
  return <MapPanelInner {...props} />
}

