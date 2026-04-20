export type EthiopiaRegionMeta = {
  /** Key used across this codebase for values (matches `regionValues` keys). */
  key: string
  /** Display name for UI. */
  name: string
  latitude: number
  longitude: number
  capital: string
}

// Source: user-provided reference list (Region/City, lat, lon, capital)
const META: EthiopiaRegionMeta[] = [
  { key: "Addis Ababa", name: "Addis Ababa", latitude: 9.0108, longitude: 38.7612, capital: "Addis Ababa" },
  { key: "Afar", name: "Afar", latitude: 11.7618, longitude: 40.9416, capital: "Semera" },
  { key: "Amhara", name: "Amhara", latitude: 11.3494, longitude: 37.9785, capital: "Bahir Dar" },
  {
    key: "Benishangul Gumuz",
    name: "Benishangul-Gumuz",
    latitude: 10.6056,
    longitude: 35.3115,
    capital: "Asosa",
  },
  { key: "Central Ethiopia", name: "Central Ethiopia", latitude: 7.0666667, longitude: 38.0, capital: "Hosaina" },
  { key: "Dire Dawa", name: "Dire Dawa", latitude: 9.6009, longitude: 41.8592, capital: "Dire Dawa" },
  { key: "Gambela", name: "Gambela", latitude: 7.9177, longitude: 34.5825, capital: "Gambela" },
  { key: "Harar", name: "Harari", latitude: 9.3149, longitude: 42.1182, capital: "Harar" },
  { key: "Oromia", name: "Oromia", latitude: 7.546, longitude: 39.2305, capital: "Addis Ababa" },
  { key: "Sidama", name: "Sidama", latitude: 6.69, longitude: 38.42, capital: "Hawassa" },
  { key: "Somali", name: "Somali", latitude: 6.6612, longitude: 43.5047, capital: "Jijiga" },
  // Codebase uses "SNNP" and "SWEP" keys; map to the new canonical names.
  { key: "SNNP", name: "South Ethiopia", latitude: 6.03, longitude: 37.55, capital: "Wolaita Sodo" },
  { key: "SWEP", name: "South West Ethiopia", latitude: 6.5, longitude: 36.0, capital: "Bonga" },
  { key: "Tigray", name: "Tigray", latitude: 13.95, longitude: 38.8, capital: "Mek'ele" },
]

export const ethiopiaRegionMetaByKey: Record<string, EthiopiaRegionMeta> = Object.fromEntries(
  META.map((m) => [m.key, m])
)

export const getEthiopiaRegionMeta = (key: string): EthiopiaRegionMeta | null => {
  return ethiopiaRegionMetaByKey[key] ?? null
}

