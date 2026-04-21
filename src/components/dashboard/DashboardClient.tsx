"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"

import type { Partner } from "@/data/partners"
import type { PartnerId } from "@/data/partnerKpis"
import { partners } from "@/data/partners"
import type { Kpi } from "@/data/kpis"
import { allKpis, kpis } from "@/data/kpis"
import { MapPanelNoSSR } from "@/components/dashboard/MapPanelNoSSR"
import { partnerRegionValues } from "@/data/partnerRegionValues"
import { regionValues } from "@/data/regionValues"

const getPartnerId = (partner: Partner): PartnerId => partner.id as PartnerId

type NavItem = { href: string; label: string }

type Props = {
  allKpis?: Kpi[]
  partnerKpis?: Kpi[]
  allRegionValues?: Record<string, number>
  partnerRegionValues?: Record<PartnerId, Record<string, number>>
  navItems?: NavItem[]
  mapTitle?: string
}

export const DashboardClient = (props: Props) => {
  const navItems =
    props.navItems ??
    ([
      { href: "/", label: "Main" },
      { href: "/kifiya-central", label: "Kifiya central" },
      { href: "/ceo-dashboard", label: "CEO dashboard" },
      { href: "/agrifin", label: "Agrifin" },
    ] as const)

  const [activePartnerId, setActivePartnerId] = useState<PartnerId | "all">("all")

  const mapValues = useMemo(
    () =>
      activePartnerId === "all"
        ? props.allRegionValues ?? regionValues
        : props.partnerRegionValues?.[activePartnerId] ??
          partnerRegionValues[activePartnerId] ??
          partnerRegionValues.partner_1,
    [activePartnerId, props.allRegionValues, props.partnerRegionValues]
  )

  const activeKpis = useMemo(
    () =>
      activePartnerId === "all"
        ? props.allKpis ?? allKpis
        : props.partnerKpis ?? kpis,
    [activePartnerId, props.allKpis, props.partnerKpis]
  )

  return (
    <>
      <div className="mt-4 h-px w-full bg-[color:var(--line)]" />

      <section className="mt-4">
        <div className="grid -mx-1 -mt-1 grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
          {activeKpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-[color:var(--card-border)] bg-[color:var(--card)] px-4 py-3"
            >
              <div className="text-[28px] font-bold tracking-tight text-[color:var(--accent)] md:text-3xl">
                {kpi.value}
              </div>
              <div className="mt-1 text-[10px] font-semibold tracking-wide text-[color:var(--muted)]">
                {kpi.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-4 h-px w-full bg-[color:var(--line)]" />

      <section className="mt-3">
        <nav className="mb-3 flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex h-8 items-center justify-center rounded-full border border-[color:var(--card-border)] bg-[color:var(--surface-2)] px-3 text-xs font-semibold tracking-wide text-[color:var(--fg)] transition hover:bg-[color:var(--surface-3)]"
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
          <div className="flex w-max min-w-full items-center justify-between gap-3 rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--card)] px-1.5 py-1">
            <button
              key="all"
              type="button"
              role="tab"
              aria-selected={activePartnerId === "all"}
              onClick={() => setActivePartnerId("all")}
              className={[
                "flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold tracking-wide transition",
                activePartnerId === "all"
                  ? "border-[color:var(--card-border)] bg-[color:var(--surface-2)] text-[color:var(--fg)]"
                  : "border-transparent bg-transparent text-[color:var(--muted)] hover:border-[color:var(--card-border)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--fg)]",
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
                      ? "border-[color:var(--card-border)] bg-[color:var(--surface-2)]"
                      : "border-transparent bg-transparent hover:border-[color:var(--card-border)] hover:bg-[color:var(--surface-2)]",
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
        <MapPanelNoSSR valuesByRegion={mapValues} mapTitle={props.mapTitle} />
      </section>
    </>
  )
}

