import { DashboardClient } from "@/components/dashboard/DashboardClient"
import { FullscreenToggle } from "@/components/FullscreenToggle"
import { agrifinKpis } from "@/data/agrifinKpis"
import { agrifinRegionValues } from "@/data/agrifinRegionValues"
import Link from "next/link"

export default function AgrifinPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-6 md:px-8 md:py-10 min-h-[100svh]">
      <div className="mx-auto w-full max-w-[546px]">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold tracking-wide text-[color:var(--muted)]">
              <Link href="/" className="hover:text-[color:var(--fg)]">
                Main dashboard
              </Link>
              <span className="text-[color:var(--muted-2)]">/</span>
              <Link href="/kifiya-central" className="hover:text-[color:var(--fg)]">
                Kifiya central
              </Link>
              <span className="text-[color:var(--muted-2)]">/</span>
              <Link href="/ceo-dashboard" className="hover:text-[color:var(--fg)]">
                CEO dashboard
              </Link>
              <span className="text-[color:var(--muted-2)]">/</span>
              <Link href="/agrifin" className="text-[color:var(--fg)]">
                Agrifin
              </Link>
            </nav>

            <p className="text-[26px] font-semibold tracking-wide text-[color:var(--muted)]">
              Leveraging AI and Data to unlock
            </p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              <span className="text-[color:var(--fg)]">Agriculture </span>
              <span className="text-[color:var(--accent)]">Finance</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <FullscreenToggle />
          </div>
        </header>
      </div>

      <DashboardClient
        allKpis={agrifinKpis}
        allRegionValues={agrifinRegionValues}
        mapTitle="Total SHF supported across regions"
        mapTintHex="#0B3B2E"
      />
    </main>
  )
}

