import type { StaticImageData } from "next/image"

export type Partner = {
  id: string
  name: string
  logo: StaticImageData
}

import logo1 from "@/logo/newlogo/1.png"
import logo2 from "@/logo/newlogo/Group.png"
import logo3 from "@/logo/newlogo/Mask group.png"
import logo4 from "@/logo/newlogo/Mask group-1.png"
import logo5 from "@/logo/newlogo/Mask group-2.png"
import logo6 from "@/logo/newlogo/Mask group-3.png"

export const partners: Partner[] = [
  { id: "partner_1", name: "Partner 1", logo: logo1 },
  { id: "partner_2", name: "Partner 2", logo: logo2 },
  { id: "partner_3", name: "Partner 3", logo: logo3 },
  { id: "partner_4", name: "Partner 4", logo: logo4 },
  { id: "partner_5", name: "Partner 5", logo: logo5 },
  { id: "partner_6", name: "Partner 6", logo: logo6 },
]

