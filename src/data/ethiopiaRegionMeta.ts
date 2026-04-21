export type EthiopiaRegionMeta = {
  /** Key used across this codebase for values (matches `regionValues` keys). */
  key: string
  /** Display name for UI. */
  name: string
  latitude: number
  longitude: number
  capital: string
  /**
   * High-level zone grouping used by the dashboard UI.
   * This is a lightweight categorization (not an administrative boundary).
   */
  zone: string
}

// Source: user-provided reference list (Region/City, lat, lon, capital)
const META: EthiopiaRegionMeta[] = [
  { key: "Addis Ababa", name: "Addis Ababa", latitude: 9.0108, longitude: 38.7612, capital: "Addis Ababa", zone: "Central" },
  { key: "Afar", name: "Afar", latitude: 11.7618, longitude: 40.9416, capital: "Semera", zone: "Northeast" },
  { key: "Amhara", name: "Amhara", latitude: 11.3494, longitude: 37.9785, capital: "Bahir Dar", zone: "North" },
  {
    key: "Benishangul Gumuz",
    name: "Benishangul-Gumuz",
    latitude: 10.6056,
    longitude: 35.3115,
    capital: "Asosa",
    zone: "West",
  },
  { key: "Central Ethiopia", name: "Central Ethiopia", latitude: 7.0666667, longitude: 38.0, capital: "Hosaina", zone: "Central" },
  { key: "Dire Dawa", name: "Dire Dawa", latitude: 9.6009, longitude: 41.8592, capital: "Dire Dawa", zone: "East" },
  { key: "Gambela", name: "Gambela", latitude: 7.9177, longitude: 34.5825, capital: "Gambela", zone: "West" },
  { key: "Harar", name: "Harari", latitude: 9.3149, longitude: 42.1182, capital: "Harar", zone: "East" },
  { key: "Oromia", name: "Oromia", latitude: 7.546, longitude: 39.2305, capital: "Addis Ababa", zone: "Central" },
  { key: "Sidama", name: "Sidama", latitude: 6.69, longitude: 38.42, capital: "Hawassa", zone: "South" },
  { key: "Somali", name: "Somali", latitude: 6.6612, longitude: 43.5047, capital: "Jijiga", zone: "East" },
  // Codebase uses "SNNP" and "SWEP" keys; map to the new canonical names.
  { key: "SNNP", name: "South Ethiopia", latitude: 6.03, longitude: 37.55, capital: "Wolaita Sodo", zone: "South" },
  { key: "SWEP", name: "South West Ethiopia", latitude: 6.5, longitude: 36.0, capital: "Bonga", zone: "Southwest" },
  { key: "Tigray", name: "Tigray", latitude: 13.95, longitude: 38.8, capital: "Mek'ele", zone: "North" },
]

export const ethiopiaRegionMetaByKey: Record<string, EthiopiaRegionMeta> = Object.fromEntries(
  META.map((m) => [m.key, m])
)

export const getEthiopiaRegionMeta = (key: string): EthiopiaRegionMeta | null => {
  return ethiopiaRegionMetaByKey[key] ?? null
}

