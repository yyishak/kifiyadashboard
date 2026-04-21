export type EthiopiaRegionZoneGroup = {
  /** Label shown in UI (e.g., "Arsi Zone", "Sub-cities"). */
  label: string
  /** Sample woreda / admin units under that group. */
  items: string[]
}

export type EthiopiaRegionZones = {
  /** Region key used across this codebase (matches map + `regionValues` keys). */
  key: string
  /** Zone groups for that region. */
  groups: EthiopiaRegionZoneGroup[]
}

/**
 * Curated zone + woreda samples based on the 2026 list you provided in chat.
 * This is not a full administrative dataset (Ethiopia has 1,100+ woredas).
 */
export const ethiopiaRegionZonesByKey: Record<string, EthiopiaRegionZoneGroup[]> = {
  "Addis Ababa": [
    {
      label: "Sub-cities (function as woredas)",
      items: [
        "Bole",
        "Kirkos",
        "Arada",
        "Yeka",
        "Lideta",
        "Akaki-Kality",
        "Addis Ketema",
        "Gullele",
        "Kolfe Keraniyo",
        "Nifas Silk-Lafto",
        "Lemi Kura",
      ],
    },
  ],
  Oromia: [
    { label: "Arsi Zone", items: ["Merti", "Jeju", "Digeluna Tijo", "Sagure", "Robe"] },
    { label: "Bale Zone", items: ["Agarfa", "Gasera", "Goba", "Ginir", "Sinana"] },
    { label: "East Shewa Zone", items: ["Adama Zuria", "Bishoftu", "Dugda", "Lume", "Liben"] },
    { label: "Jimma Zone", items: ["Gomma", "Mana", "Limmu Kosa", "Kersa", "Seka Chekorsa"] },
    { label: "West Guji Zone", items: ["Bule Hora", "Kercha", "Birbirsa Kojowa"] },
    { label: "Sheger City (new administration)", items: ["Sululta", "Burayu", "Sebeta"] },
  ],
  Amhara: [
    { label: "North Gondar Zone", items: ["Debark", "Dabat", "Gondar Zuria", "Addi Arkay"] },
    { label: "South Wollo Zone", items: ["Dessie Zuria", "Kalu", "Ambassel", "Tehuledere"] },
    { label: "West Gojjam Zone", items: ["Bahir Dar Zuria", "Mecha", "Yilmana Densa", "North Achefer"] },
    { label: "Awi Zone", items: ["Dangila", "Enjibara", "Guangua", "Jawi"] },
    { label: "North Shewa (Amhara)", items: ["Debre Berhan", "Menz", "Ankober", "Kewet"] },
  ],
  Tigray: [
    { label: "Central Tigray", items: ["Adwa", "Axum", "Ahferom", "Mereb Lehe"] },
    { label: "Eastern Tigray", items: ["Adigrat", "Wukro", "Gulomahda", "Saesi Tsaedaemba"] },
    { label: "Southern Tigray", items: ["Maichew", "Alamata", "Endamehoni", "Ofla"] },
    { label: "North Western Tigray", items: ["Shire (Inda Selassie)", "Medebay Zana", "Asgede Tsebela"] },
  ],
  Somali: [
    { label: "Jijiga (Fafan) Zone", items: ["Jijiga Zuria", "Babille", "Gursum", "Kebribeyah"] },
    { label: "Sitti Zone", items: ["Shinile", "Afdem", "Erer", "Meiso"] },
    { label: "Liben Zone", items: ["Moyale", "Dekasuftu", "Filtu"] },
    { label: "Gode (Shabelle) Zone", items: ["Gode", "Adadle", "Berano"] },
  ],
  "Central Ethiopia": [
    { label: "Gurage Zone", items: ["Wolkite", "Abeshge", "Cheha", "Ennemor"] },
    { label: "Silte Zone", items: ["Worabe", "Lanfuro", "Sankuru"] },
    { label: "Hadiya Zone", items: ["Hosanna", "Lemo", "Misha", "Sorro"] },
    { label: "Kembata Tembaro Zone", items: ["Durame", "Angacha", "Kachabira"] },
    { label: "Special Woreda", items: ["Yem"] },
  ],
  // Codebase key "SNNP" is used for South Ethiopia in this dashboard.
  SNNP: [
    { label: "Wolaita Zone", items: ["Sodo Zuria", "Damot Gale", "Humbo", "Kindo Koysha"] },
    { label: "Gamo Zone", items: ["Arba Minch Zuria", "Bonke", "Chencha", "Mirab Abaya"] },
    { label: "Gedeo Zone", items: ["Dilla Zuria", "Yirgacheffe", "Kochere", "Bule"] },
    { label: "Konso Zone", items: ["Karat", "Konso Zuria"] },
  ],
  // Codebase key "SWEP" is used for South West Ethiopia.
  SWEP: [
    { label: "Keffa Zone", items: ["Bonga", "Chena", "Gimbo", "Decha"] },
    { label: "Bench Sheko Zone", items: ["Mizan Aman", "Debre Work", "Guraferda"] },
    { label: "Dawro Zone", items: ["Tercha", "Mareka", "Isara"] },
    { label: "Sheka Zone", items: ["Masha", "Anderacha", "Yeki"] },
  ],
  Afar: [
    { label: "Awsi Rasu (Zone 1)", items: ["Asayita", "Dubti", "Chifra", "Mille"] },
    { label: "Kilbet Rasu (Zone 2)", items: ["Abala", "Afdera", "Dallol", "Berhale"] },
    { label: "Gabi Rasu (Zone 3)", items: ["Awash Fentale", "Amibara", "Gewane"] },
  ],
  Sidama: [
    { label: "Woredas", items: ["Hawassa (City)", "Aleta Wondo", "Dale", "Bensa", "Aroresa", "Dara", "Hawassa Zuria"] },
  ],
}

