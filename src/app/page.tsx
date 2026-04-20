import { DashboardClient } from "@/components/dashboard/DashboardClient"

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-6 md:px-8 md:py-10 min-h-[100svh]">
      <div className="mx-auto w-full max-w-[546px]">
        <header className="flex flex-col gap-2">
          <p className="text-[26px] font-semibold tracking-wide text-white/70">
            Leveraging AI and Data to unlock
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            <span className="text-white">MSME </span>
            <span className="text-[#f28b2c]">Financing</span>
          </h1>
        </header>
      </div>

      <DashboardClient />
    </main>
  )
}
