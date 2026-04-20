export type Partner = {
  id: string
  name: string
  logo: any
}

import logo1 from "@/logo/1.png"
import logo2 from "@/logo/2.png"
import logo3 from "@/logo/3.png"
import logo4 from "@/logo/4.png"
import logo5 from "@/logo/5.png"
import logo6 from "@/logo/6.png"

export const partners: Partner[] = [
  { id: "partner_1", name: "Partner 1", logo: logo1 },
  { id: "partner_2", name: "Partner 2", logo: logo2 },
  { id: "partner_3", name: "Partner 3", logo: logo3 },
  { id: "partner_4", name: "Partner 4", logo: logo4 },
  { id: "partner_5", name: "Partner 5", logo: logo5 },
  { id: "partner_6", name: "Partner 6", logo: logo6 },
]

