import Link from "next/link"

export default function KifiyaCentralPage() {
  const cards: Array<{
    kicker: string
    title: string
    value: string
    isTrend?: boolean
  }> = [
    {
      kicker: "3",
      title: "Total Disbursed Loans Count",
      value: "4.08M",
    },
    {
      kicker: "3",
      title: "Total Disbursed Amount",
      value: "78,032,920,406",
    },
    {
      kicker: "3",
      title: "Total Number of Loans Disbursed Today (R)",
      value: "4,343",
    },
    {
      kicker: "3",
      title: "Total Amount of Disbursed Loans Today (R)",
      value: "137,302,136",
    },
    {
      kicker: "3",
      title: "Disbursement Trend",
      value: "—",
      isTrend: true,
    },
  ]

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-6 md:px-8 md:py-10 min-h-[100svh]">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold tracking-wide text-[color:var(--muted)]">
            <Link href="/" className="hover:text-[color:var(--fg)]">
              Main dashboard
            </Link>
            <span className="text-[color:var(--muted-2)]">/</span>
            <Link href="/kifiya-central" className="text-[color:var(--fg)]">
              Kifiya central
            </Link>
            <span className="text-[color:var(--muted-2)]">/</span>
            <Link href="/ceo-dashboard" className="hover:text-[color:var(--fg)]">
              CEO dashboard
            </Link>
            <span className="text-[color:var(--muted-2)]">/</span>
            <Link href="/agrifin" className="hover:text-[color:var(--fg)]">
              Agrifin
            </Link>
          </nav>
          <p className="text-[22px] font-semibold tracking-wide text-[color:var(--muted)] md:text-[26px]">
            Additional dashboard
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            <span className="text-[color:var(--fg)]">Kifiya </span>
            <span className="text-[color:var(--accent)]">central</span>
          </h1>
        </div>
      </header>

      <section className="mt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.title}
              className={[
                "rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-5",
                c.isTrend ? "sm:col-span-2 lg:col-span-3" : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm font-semibold tracking-wide text-[color:var(--muted)]">{c.title}</div>
                <div className="grid h-7 min-w-7 place-items-center rounded-full border border-[color:var(--card-border)] bg-[color:var(--surface-2)] px-2 text-xs font-semibold text-[color:var(--fg)]">
                  {c.kicker}
                </div>
              </div>

              <div className="mt-3 text-[28px] font-bold tracking-tight text-[color:var(--accent)] md:text-3xl">
                {c.value}
              </div>

              {c.isTrend ? (
                <div className="mt-4 rounded-xl border border-[color:var(--card-border)] bg-[color:var(--surface-2)] p-4 text-sm text-[color:var(--muted)]">
                  Trend visualization placeholder (hook up chart here).
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

