export default function KifiyaCentralPage() {
  const cards = [
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
  ] as const

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-6 md:px-8 md:py-10 min-h-[100svh]">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-[22px] font-semibold tracking-wide text-white/70 md:text-[26px]">
            Additional dashboard
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            <span className="text-white">Kifiya </span>
            <span className="text-[#f28b2c]">central</span>
          </h1>
        </div>
      </header>

      <section className="mt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.title}
              className={[
                "rounded-2xl border border-white/15 bg-[#02404F] p-5",
                c.isTrend ? "sm:col-span-2 lg:col-span-3" : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm font-semibold tracking-wide text-white/75">{c.title}</div>
                <div className="grid h-7 min-w-7 place-items-center rounded-full border border-white/15 bg-white/10 px-2 text-xs font-semibold text-white/85">
                  {c.kicker}
                </div>
              </div>

              <div className="mt-3 text-[28px] font-bold tracking-tight text-[#f28b2c] md:text-3xl">
                {c.value}
              </div>

              {c.isTrend ? (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/70">
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

