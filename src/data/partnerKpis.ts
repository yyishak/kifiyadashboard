import type { Kpi } from "@/data/kpis"

export type PartnerId =
  | "partner_1"
  | "partner_2"
  | "partner_3"
  | "partner_4"
  | "partner_5"
  | "partner_6"

export const partnerKpis: Record<PartnerId, Kpi[]> = {
  partner_1: [
    { label: "Total Disbursement", value: "ETB 61.2B+" },
    { label: "MSMEs accessed credit", value: "697K+" },
    { label: "Loan applications scored", value: "3.67M" },
    { label: "Banks", value: "6" },
  ],
  partner_2: [
    { label: "Total Disbursement", value: "ETB 22.8B+" },
    { label: "MSMEs accessed credit", value: "198K+" },
    { label: "Loan applications scored", value: "1.04M" },
    { label: "Banks", value: "1" },
  ],
  partner_3: [
    { label: "Total Disbursement", value: "ETB 14.6B+" },
    { label: "MSMEs accessed credit", value: "126K+" },
    { label: "Loan applications scored", value: "820K" },
    { label: "Banks", value: "1" },
  ],
  partner_4: [
    { label: "Total Disbursement", value: "ETB 9.3B+" },
    { label: "MSMEs accessed credit", value: "88K+" },
    { label: "Loan applications scored", value: "510K" },
    { label: "Banks", value: "1" },
  ],
  partner_5: [
    { label: "Total Disbursement", value: "ETB 7.9B+" },
    { label: "MSMEs accessed credit", value: "61K+" },
    { label: "Loan applications scored", value: "430K" },
    { label: "Banks", value: "1" },
  ],
  partner_6: [
    { label: "Total Disbursement", value: "ETB 6.6B+" },
    { label: "MSMEs accessed credit", value: "52K+" },
    { label: "Loan applications scored", value: "370K" },
    { label: "Banks", value: "1" },
  ],
}

