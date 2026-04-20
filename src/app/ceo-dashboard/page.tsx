const TopTab = ({ label, active }: { label: string; active?: boolean }) => (
  <button
    type="button"
    className={[
      "rounded-full px-3 py-1.5 text-sm font-semibold transition",
      active
        ? "border border-white/20 bg-white/10 text-white shadow-sm"
        : "text-white/80 hover:bg-white/10 hover:text-white",
    ].join(" ")}
  >
    {label}
  </button>
)

const FilterPill = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-[color:var(--card-border)] bg-[color:var(--surface-2)] px-3 py-2">
    <div className="text-[11px] font-semibold tracking-wide text-[color:var(--muted)]">{label}</div>
    <div className="mt-1 text-sm font-semibold text-[color:var(--fg)]">{value}</div>
  </div>
)

const MetricCard = ({
  title,
  badge,
  value,
  unit,
}: {
  title: string
  badge: string
  value: string
  unit?: string
}) => (
  <div className="rounded-xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="text-[12px] font-semibold text-[color:var(--muted)]">{title}</div>
      <div className="grid h-6 min-w-6 place-items-center rounded-full border border-[color:var(--card-border)] bg-[color:var(--surface-2)] px-2 text-[11px] font-bold text-[color:var(--fg)]">
        {badge}
      </div>
    </div>
    <div className="mt-2 flex items-baseline gap-2">
      <div className="text-2xl font-bold tracking-tight text-[color:var(--accent)]">{value}</div>
      {unit ? <div className="text-sm font-semibold text-[color:var(--muted)]">{unit}</div> : null}
    </div>
  </div>
)

const ChartCard = ({
  title,
  subtitle,
  heightClass,
}: {
  title: string
  subtitle?: string
  heightClass?: string
}) => (
  <div className="rounded-xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-4">
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-bold text-[color:var(--fg)]">{title}</div>
        {subtitle ? <div className="mt-1 text-xs text-[color:var(--muted-2)]">{subtitle}</div> : null}
      </div>
      <div className="text-xs font-semibold text-[color:var(--muted-2)]">Loading…</div>
    </div>
    <div
      className={[
        "mt-4 w-full overflow-hidden rounded-lg border border-[color:var(--card-border)] bg-[color:var(--surface-2)]",
        heightClass ?? "h-[220px]",
      ].join(" ")}
    >
      <div className="h-full w-full p-4">
        <div className="h-full w-full rounded-md bg-gradient-to-b from-[color:var(--surface-3)] to-[color:var(--surface-2)]" />
      </div>
    </div>
    <div className="mt-2 text-xs text-[color:var(--muted-2)]">Waiting on Central LoanData</div>
  </div>
)

export default function CeoDashboardPage() {
  const topMetrics = [
    { title: "Interest of Income", badge: "2", value: "33.9", unit: "M" },
    { title: "Cost of Fund", badge: "2", value: "6.86", unit: "M" },
    { title: "Penality", badge: "2", value: "7.33", unit: "M" },
    { title: "Net Profit before tax", badge: "2", value: "11.1", unit: "M" },
    { title: "Marketing Expense", badge: "2", value: "201", unit: "k" },
    { title: "Operation Expense", badge: "2", value: "664", unit: "k" },
    { title: "Total operating income", badge: "2", value: "35.9", unit: "M" },
    { title: "Partner Bank Share", badge: "2", value: "7.76", unit: "M" },
    { title: "Total Kifiya Share", badge: "2", value: "3.82", unit: "M" },
    { title: "Kifiya Share", badge: "2", value: "3.32", unit: "M" },
  ] as const

  const bigTiles = [
    { title: "Disbursed This Week", value: "21.8", unit: "M ETB" },
    { title: "Disbursed This Month", value: "1.9", unit: "B ETB" },
    { title: "Disbursed This Year", value: "12.5", unit: "B ETB" },
    { title: "Disbursed To Date", value: "21.8", unit: "M ETB" },
  ] as const

  return (
    <div className="min-h-[100svh] bg-[color:var(--bg)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-6 md:px-8 md:py-10">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-4 text-[color:var(--fg)]">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold tracking-tight">Kifiya</div>
              <div className="rounded-full border border-[color:var(--card-border)] bg-[color:var(--surface-2)] px-2 py-1 text-[11px] font-semibold text-[color:var(--fg)]">
                CEO
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <TopTab label="Dashboards" active />
              <TopTab label="Charts" />
              <TopTab label="Datasets" />
              <TopTab label="SQL" />
              <TopTab label="Settings" />
            </div>

            <div className="mt-6">
              <div className="text-xs font-bold tracking-wide text-[color:var(--muted)]">Filters</div>
              <div className="mt-3 space-y-2">
                <FilterPill label="Banks" value="Loading..." />
                <FilterPill label="Loan Product" value="Loading..." />
                <FilterPill label="Month" value="Loading..." />
                <FilterPill label="Disbersment Date" value="Loading..." />
                <FilterPill label="Scenario Type" value="Loading..." />
              </div>
            </div>
          </aside>

          <main className="space-y-4">
            <header className="rounded-xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-[color:var(--muted)]">CEO Dashboard</div>
                  <div className="mt-1 text-xs text-[color:var(--muted-2)]">
                    Published · Admin User · 11 days ago
                  </div>
                </div>
                <div className="text-xs font-semibold text-[color:var(--muted-2)]">Waiting on Central LoanData</div>
              </div>
            </header>

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {topMetrics.map((m) => (
                <MetricCard
                  key={m.title}
                  title={m.title}
                  badge={m.badge}
                  value={m.value}
                  unit={m.unit}
                />
              ))}
              <MetricCard title="Total Kifiya's share" badge="1" value="—" />
            </section>

            <section className="grid grid-cols-1 gap-4">
              <ChartCard
                title="Disbursement and Loan Collection Month to Date"
                heightClass="h-[260px]"
              />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ChartCard title="Weekly Disbursement Volume" />
                <ChartCard title="Monthly Disbursement Volume" />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {bigTiles.map((t) => (
                <div
                  key={t.title}
                  className="rounded-xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-5"
                >
                  <div className="text-sm font-semibold text-[color:var(--muted)]">{t.title}</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <div className="text-3xl font-bold tracking-tight text-[color:var(--accent)]">
                      {t.value}
                    </div>
                    <div className="text-sm font-semibold text-[color:var(--muted)]">{t.unit}</div>
                  </div>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Vintage Provisioning" />
              <ChartCard title="Recovery Efficiency by Disbursement Date (Vintage Analysis)" />
              <ChartCard title="Inception-to-Date (ITD) Revenue" />
              <ChartCard title="Capital Deployement Comparision" />
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

