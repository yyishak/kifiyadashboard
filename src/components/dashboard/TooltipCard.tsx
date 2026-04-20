"use client"

type Props = {
  title: string
  value: string
}

export const TooltipCard = ({ title, value }: Props) => {
  return (
    <div className="w-[220px] rounded-2xl border border-white/15 bg-white/95 px-3 py-2 text-[#0b2f34] shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
      <div className="text-xs font-semibold text-[#0b2f34]/70">{title}</div>
      <div className="mt-0.5 text-sm font-semibold tracking-tight text-[#0b2f34]">
        {value}
      </div>
    </div>
  )
}

