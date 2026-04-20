import { DashboardClient } from "@/components/dashboard/DashboardClient"
import { FullscreenToggle } from "@/components/FullscreenToggle"
import Link from "next/link"

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-6 md:px-8 md:py-10 min-h-[100svh]">
      <div className="mx-auto w-full max-w-[546px]">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-[26px] font-semibold tracking-wide text-white/70">
              Leveraging AI and Data to unlock
            </p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              <span className="text-white">MSME </span>
              <span className="text-[#f28b2c]">Financing</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/kifiya-central"
              className="inline-flex h-9 items-center justify-center rounded-full border border-white/15 bg-white/10 px-3 text-sm font-semibold tracking-wide text-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur transition hover:border-white/25 hover:bg-white/15"
            >
              Kifiya central
            </Link>
            <Link
              href="/ceo-dashboard"
              className="inline-flex h-9 items-center justify-center rounded-full border border-white/15 bg-white/10 px-3 text-sm font-semibold tracking-wide text-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur transition hover:border-white/25 hover:bg-white/15"
            >
              CEO dashboard
            </Link>
            <FullscreenToggle />
          </div>
        </header>
      </div>

      <DashboardClient />
    </main>
  )
}
