"use client"

type Props = {
  label: string
  value: string
  className?: string
}

export const RegionPin = ({ label, value, className }: Props) => {
  return (
    <svg
      width="189"
      height="98"
      viewBox="0 0 189 98"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="0" y="0" width="189" height="86" rx="16" fill="white" fillOpacity="0.92" />
      <path d="M94.5 97.2393L83.3653 83.7393H105.635L94.5 97.2393Z" fill="white" fillOpacity="0.92" />
      <text
        x="94.5"
        y="36"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Inter Tight, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
        fontSize="15"
        fontWeight="700"
        fill="#00313D"
      >
        {label}
      </text>
      <text
        x="94.5"
        y="58"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Inter Tight, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
        fontSize="14"
        fontWeight="700"
        fill="#00313D"
        opacity="0.85"
      >
        {value}
      </text>
    </svg>
  )
}

