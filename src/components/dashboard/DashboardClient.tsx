"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"

import type { Partner } from "@/data/partners"
import type { PartnerId } from "@/data/partnerKpis"
import { partners } from "@/data/partners"
import { allKpis, kpis } from "@/data/kpis"
import { MapPanelNoSSR } from "@/components/dashboard/MapPanelNoSSR"
import { partnerRegionValues } from "@/data/partnerRegionValues"
import { regionValues } from "@/data/regionValues"

const getPartnerId = (partner: Partner): PartnerId => partner.id as PartnerId

export const DashboardClient = () => {
  const [activePartnerId, setActivePartnerId] = useState<PartnerId | "all">("all")

  const mapValues = useMemo(
    () =>
      activePartnerId === "all"
        ? regionValues
        : partnerRegionValues[activePartnerId] ?? partnerRegionValues.partner_1,
    [activePartnerId]
  )

  const activeKpis = useMemo(
    () => (activePartnerId === "all" ? allKpis : kpis),
    [activePartnerId]
  )

  return (
    <>
      <div className="mt-4 h-px w-full bg-white/20" />

      <section className="mt-4">
        <div className="grid -mx-1 -mt-1 grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
          {activeKpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-white/15 bg-[#02404F] px-4 py-3"
            >
              <div className="text-[28px] font-bold tracking-tight text-[#f28b2c] md:text-3xl">
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
        <nav className="mb-3 flex flex-wrap items-center gap-2">
          {[
            { href: "/", label: "Main" },
            { href: "/kifiya-central", label: "Kifiya central" },
            { href: "/ceo-dashboard", label: "CEO dashboard" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex h-8 items-center justify-center rounded-full border border-white/15 bg-white/10 px-3 text-xs font-semibold tracking-wide text-white/90 transition hover:border-white/25 hover:bg-white/15"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div
          className="w-full overflow-x-auto"
          aria-label="Partner tabs"
          role="tablist"
        >
          <div className="flex w-max min-w-full items-center justify-between gap-3 rounded-[48px] border border-white/15 bg-[#02404F] py-1">
            <button
              key="all"
              type="button"
              role="tab"
              aria-selected={activePartnerId === "all"}
              onClick={() => setActivePartnerId("all")}
              className={[
                "flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold tracking-wide transition",
                activePartnerId === "all"
                  ? "border-white/35 bg-white/10 text-white"
                  : "border-white/0 bg-transparent text-white/80 hover:border-white/15 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              All
            </button>

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
                      : "border-white/0 bg-transparent hover:border-white/15 hover:bg-white/10",
                  ].join(" ")}
                >
                  <Image
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className={[
                      "h-5 w-auto",
                      isActive ? "opacity-95" : "opacity-75 grayscale",
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
    </>
  )
}

