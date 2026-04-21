import type { StaticImageData } from "next/image"

export type Partner = {
  id: string
  name: string
  logo: StaticImageData
}

import newLogo from "@/logo/newlogo/Group.png"

export const partners: Partner[] = [
  { id: "partner_1", name: "Partner 1", logo: newLogo },
  { id: "partner_2", name: "Partner 2", logo: newLogo },
  { id: "partner_3", name: "Partner 3", logo: newLogo },
  { id: "partner_4", name: "Partner 4", logo: newLogo },
  { id: "partner_5", name: "Partner 5", logo: newLogo },
  { id: "partner_6", name: "Partner 6", logo: newLogo },
]

