"use client"

import { useMemo, useState } from "react"
import Image from "next/image"

import type { Partner } from "@/data/partners"
import type { PartnerId } from "@/data/partnerKpis"
import { partners } from "@/data/partners"
import { kpis } from "@/data/kpis"
import { MapPanelNoSSR } from "@/components/dashboard/MapPanelNoSSR"
import { partnerRegionValues } from "@/data/partnerRegionValues"
import frameCollage from "@/logo/Frame 2085661624.png"

const getPartnerId = (partner: Partner): PartnerId => partner.id as PartnerId

export const DashboardClient = () => {
  const [activePartnerId, setActivePartnerId] = useState<PartnerId>("partner_1")

  const mapValues = useMemo(
    () => partnerRegionValues[activePartnerId] ?? partnerRegionValues.partner_1,
    [activePartnerId]
  )

  return (
    <>
      <div className="mt-4 h-px w-full bg-white/20" />

      <section className="mt-4">
        <div className="grid -mx-1 -mt-1 grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-3"
            >
              <div className="text-2xl font-semibold tracking-tight text-[#f28b2c] md:text-3xl">
                {kpi.value}
              </div>
              <div className="mt-1 text-[10px] font-semibold tracking-wide text-white/70">
                {kpi.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-4 h-px w-full bg-white/20" />

      <section className="mt-3">
        <div
          className="w-full overflow-x-auto"
          aria-label="Partner tabs"
          role="tablist"
        >
          <div className="flex w-max min-w-full items-center justify-between gap-3 py-1 rounded-[48px] border border-black bg-white">
            {partners.map((partner) => {
              const id = getPartnerId(partner)
              const isActive = id === activePartnerId

              return (
                <button
                  key={partner.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActivePartnerId(id)}
                  className={[
                    "flex h-9 items-center justify-center rounded-lg border px-2 transition",
                    isActive
                      ? "border-white/35 bg-white/10"
                      : "border-white/0 bg-transparent hover:border-white/15 hover:bg-white/5",
                  ].join(" ")}
                >
                  <Image
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className={[
                      "h-5 w-auto",
                      isActive ? "opacity-95" : "opacity-75 grayscale-[20%]",
                    ].join(" ")}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mt-6 -mx-5 md:-mx-8">
        <MapPanelNoSSR valuesByRegion={mapValues} />
      </section>

      <section className="mt-6">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <Image
            src={frameCollage}
            alt="MSME collage"
            className="h-auto w-full"
            priority
          />
        </div>
      </section>
    </>
  )
}

