"use client"

import { useMemo, useState } from "react"
import { EthiopiaMapView } from "@/components/dashboard/EthiopiaMapView"

type TabKey = "light" | "dark" | "demo"

type Props = {
  valuesByRegion?: Record<string, number>
}

const tabs: { key: TabKey; label: string; mapStyle: string }[] = [
  {
    key: "light",
    label: "Voyager (Light)",
    mapStyle: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  },
  {
    key: "dark",
    label: "Dark Matter",
    mapStyle: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  },
  // Commonly used in deck.gl + MapLibre examples/demos
  {
    key: "demo",
    label: "MapLibre Demo",
    mapStyle: "https://demotiles.maplibre.org/style.json",
  },
]

export const MapPanel = ({ valuesByRegion }: Props) => {
  const [active, setActive] = useState<TabKey>("light")

  const activeTab = useMemo(
    () => tabs.find((t) => t.key === active) ?? tabs[0],
    [active]
  )

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-3 px-5 pt-3 md:px-8 md:pt-4">
          <div className="pointer-events-auto flex items-center rounded-full border border-white/20 bg-black/10 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  tab.key === active
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:text-white",
                ].join(" ")}
                aria-label={`Switch map style to ${tab.label}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pointer-events-auto text-right">
            <div className="text-sm font-semibold tracking-wide text-white/90">
              Total MSME&apos;s
            </div>
          </div>
        </div>
      </div>

      <div className="h-[520px] md:h-[620px]">
        <EthiopiaMapView
          mapStyle={activeTab.mapStyle}
          valuesByRegion={valuesByRegion}
        />
      </div>
    </div>
  )
}

