"use client"

import { EthiopiaMapView } from "@/components/dashboard/EthiopiaMapView"
import { ImageTicker } from "@/components/dashboard/ImageTicker"
import { tickerImages } from "@/1/tickerImages"

type Props = {
  valuesByRegion?: Record<string, number>
}

export const MapPanel = ({ valuesByRegion }: Props) => {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-3 px-5 pt-3 md:px-8 md:pt-4">
          <div />

          <div className="pointer-events-auto text-right">
            <div className="text-sm font-semibold tracking-wide text-white/90">
              Total MSME&apos;s
            </div>
          </div>
        </div>
      </div>

      <div className="h-[520px] md:h-[620px]">
        <EthiopiaMapView valuesByRegion={valuesByRegion} />
      </div>

      <div className="mt-4 px-5 md:px-8">
        <ImageTicker images={tickerImages} alt="Map ticker images" className="mx-auto max-w-6xl" />
      </div>
    </div>
  )
}

