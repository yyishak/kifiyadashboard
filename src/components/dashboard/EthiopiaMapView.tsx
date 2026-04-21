"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import DeckGL from "@deck.gl/react"
import { GeoJsonLayer, TextLayer } from "@deck.gl/layers"
import { FlyToInterpolator, WebMercatorViewport } from "@deck.gl/core"
import type { Layer } from "@deck.gl/core"
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry } from "geojson"
import Map from "react-map-gl/maplibre"

import ethiopiaGeoJson from "@/data/ethiopiaRegions.json"
import { getEthiopiaRegionMeta } from "@/data/ethiopiaRegionMeta"
import { ethiopiaRegionZonesByKey } from "@/data/ethiopiaRegionZones"

type Props = {
  valuesByRegion?: Record<string, number>
}

const MAP_STYLE_URL =
  "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json"
const MAP_DARK_TINT = "#00313D"

const INITIAL_VIEW_STATE = {
  longitude: 40.0,
  latitude: 8.7,
  zoom: 4.6,
  minZoom: 4.2,
  maxZoom: 8,
  pitch: 0,
  bearing: 0,
}

type RegionFeatureProperties = {
  name?: unknown
  labelLngLat?: unknown
}

type RegionFeature = {
  properties?: RegionFeatureProperties
  geometry?: { coordinates?: unknown }
}

type RegionFeatureCollection = {
  features?: RegionFeature[]
}

type RegionSidebarData = {
  key: string
  displayName: string
  zone: string | null
  capital: string | null
  geometry: Geometry | null
  value: number | null
  valueText: string
  percentText: string
  maleText: string
  femaleText: string
  youthReachedText: string
}

type GeometryBounds = { minX: number; minY: number; maxX: number; maxY: number }

const formatWholeNumber = (value: number | null): string => {
  if (value == null) return "—"
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)
}

const hashStringToUint32 = (input: string): number => {
  // Small, deterministic hash (FNV-1a-ish) to seed pseudo-random numbers.
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const getRegionRandomBreakdown = (
  key: string,
  total: number | null
): { male: number | null; female: number | null; youth: number | null } => {
  if (total == null) return { male: null, female: null, youth: null }
  const rand = mulberry32(hashStringToUint32(key))

  const maleShare = 0.48 + rand() * 0.08 // 48–56%
  const male = Math.max(0, Math.min(total, Math.round(total * maleShare)))
  const female = Math.max(0, total - male)

  const youthShare = 0.25 + rand() * 0.15 // 25–40%
  const youth = Math.max(0, Math.min(total, Math.round(total * youthShare)))

  return { male, female, youth }
}

const computeGeometryBounds = (geometry: Geometry | null): GeometryBounds | null => {
  if (!geometry) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  const push = (pt: unknown) => {
    if (!Array.isArray(pt) || pt.length < 2) return
    const x = pt[0]
    const y = pt[1]
    if (typeof x !== "number" || typeof y !== "number") return
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }

  const walk = (node: unknown) => {
    if (!node) return
    if (Array.isArray(node)) {
      if (node.length >= 2 && typeof node[0] === "number" && typeof node[1] === "number") {
        push(node)
        return
      }
      for (const child of node) walk(child)
    }
  }

  const coords =
    geometry && typeof geometry === "object" && "coordinates" in geometry
      ? (geometry as unknown as { coordinates?: unknown }).coordinates
      : undefined
  walk(coords)

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null
  return { minX, minY, maxX, maxY }
}

const geometryToSvgPath = (geometry: Geometry | null, width: number, height: number, pad = 10): string => {
  const b = computeGeometryBounds(geometry)
  if (!geometry || !b) return ""

  const w = Math.max(1, width - pad * 2)
  const h = Math.max(1, height - pad * 2)

  const dx = Math.max(1e-9, b.maxX - b.minX)
  const dy = Math.max(1e-9, b.maxY - b.minY)
  const s = Math.min(w / dx, h / dy)

  const tx = pad + (w - dx * s) / 2
  const ty = pad + (h - dy * s) / 2

  const project = (pt: number[]) => {
    const x = tx + (pt[0] - b.minX) * s
    const y = ty + (b.maxY - pt[1]) * s
    return [x, y] as const
  }

  const ringToPath = (ring: number[][]) => {
    if (ring.length === 0) return ""
    const [sx, sy] = project(ring[0])
    let d = `M ${sx.toFixed(2)} ${sy.toFixed(2)}`
    for (let i = 1; i < ring.length; i++) {
      const [x, y] = project(ring[i])
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`
    }
    d += " Z"
    return d
  }

  if (geometry.type === "Polygon") {
    const coords = (geometry.coordinates ?? []) as number[][][]
    return coords.map(ringToPath).filter(Boolean).join(" ")
  }

  if (geometry.type === "MultiPolygon") {
    const coords = (geometry.coordinates ?? []) as number[][][][]
    return coords
      .flatMap((poly) => poly.map(ringToPath))
      .filter(Boolean)
      .join(" ")
  }

  return ""
}

const geoJsonData = ethiopiaGeoJson as unknown as FeatureCollection<Geometry, GeoJsonProperties>

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const clamp01 = (t: number) => Math.max(0, Math.min(1, t))

const heatColorGreenToRed = (tRaw: number) => {
  const t = clamp01(tRaw)
  // Tailwind-ish: green-500 -> red-500
  const from = { r: 34, g: 197, b: 94 }
  const to = { r: 239, g: 68, b: 68 }
  const r = Math.round(lerp(from.r, to.r, t))
  const g = Math.round(lerp(from.g, to.g, t))
  const b = Math.round(lerp(from.b, to.b, t))
  return { r, g, b }
}

const getFeatureName = (feature: unknown) => {
  if (typeof feature !== "object" || feature == null) return ""
  const f = feature as RegionFeature
  const name = f.properties?.name
  return `${typeof name === "string" ? name : ""}`.trim()
}

const getFeatureLabelLngLat = (feature: unknown): [number, number] | null => {
  const name = getFeatureName(feature)
  const meta = name ? getEthiopiaRegionMeta(name) : null
  if (meta) return [meta.longitude, meta.latitude]

  if (typeof feature !== "object" || feature == null) return null
  const f = feature as RegionFeature
  const ll = f.properties?.labelLngLat
  if (
    Array.isArray(ll) &&
    ll.length >= 2 &&
    typeof ll[0] === "number" &&
    typeof ll[1] === "number"
  ) {
    return [ll[0], ll[1]]
  }
  return null
}

type LngLatBounds = [[number, number], [number, number]]

const computeGeoJsonBounds = (geojson: unknown): LngLatBounds | null => {
  const coords: Array<[number, number]> = []

  const pushCoords = (c: unknown) => {
    if (!c) return
    if (
      Array.isArray(c) &&
      c.length >= 2 &&
      typeof c[0] === "number" &&
      typeof c[1] === "number"
    ) {
      coords.push([c[0], c[1]])
      return
    }
    if (Array.isArray(c)) {
      for (const child of c) pushCoords(child)
    }
  }

  if (typeof geojson !== "object" || geojson == null) return null
  const features = (geojson as RegionFeatureCollection).features ?? []
  for (const f of features) pushCoords(f?.geometry?.coordinates)
  if (coords.length === 0) return null

  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity
  for (const [lng, lat] of coords) {
    minLng = Math.min(minLng, lng)
    minLat = Math.min(minLat, lat)
    maxLng = Math.max(maxLng, lng)
    maxLat = Math.max(maxLat, lat)
  }

  if (!Number.isFinite(minLng) || !Number.isFinite(minLat)) return null
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

export const EthiopiaMapView = (props: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const deckRef = useRef<null | { deck?: { pickObject?: (opts: unknown) => unknown } }>(null)
  const touchDownRef = useRef<{ x: number; y: number; pointerId: number; pointerType: string } | null>(
    null
  )
  const [viewState, setViewState] = useState<
    (typeof INITIAL_VIEW_STATE & { width?: number; height?: number }) | null
  >(null)
  const [mapStyle, setMapStyle] = useState<unknown>(MAP_STYLE_URL)
  const [selectedRegionName, setSelectedRegionName] = useState<string | null>(null)
  const [sidebar, setSidebar] = useState<RegionSidebarData | null>(null)
  const [isZonesPanelOpen, setIsZonesPanelOpen] = useState(false)
  const [hoveredRegionName, setHoveredRegionName] = useState<string | null>(null)

  const values = useMemo(
    () => props.valuesByRegion ?? {},
    [props.valuesByRegion]
  )

  useEffect(() => {
    let cancelled = false

    const tint = (value: unknown): unknown => {
      if (typeof value === "string") {
        const v = value.toLowerCase()
        if (v === "#0e0e0e" || v === "#111" || v === "#000" || v === "#000000") return MAP_DARK_TINT
        return v.replace(/rgba\(0,\s*0,\s*0,\s*([0-9.]+)\)/g, `rgba(0, 49, 61, $1)`)
      }
      if (Array.isArray(value)) return value.map(tint)
      if (typeof value === "object" && value != null) {
        const out: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(value)) out[k] = tint(v)
        return out
      }
      return value
    }

    fetch(MAP_STYLE_URL)
      .then((r) => r.json())
      .then((style) => {
        if (cancelled) return
        if (style && typeof style === "object") {
          const typedStyle = style as { layers?: unknown[] }
          if (Array.isArray(typedStyle.layers)) {
            typedStyle.layers = typedStyle.layers.map((layer) => {
              const next = typeof layer === "object" && layer != null ? { ...(layer as Record<string, unknown>) } : layer
              if (typeof next === "object" && next != null) {
                const id = (next as Record<string, unknown>).id
                const paint = (next as Record<string, unknown>).paint
                if (id === "background" && typeof paint === "object" && paint != null) {
                  ;(next as Record<string, unknown>).paint = {
                    ...(paint as Record<string, unknown>),
                    "background-color": MAP_DARK_TINT,
                  }
                }
                const nextPaint = (next as Record<string, unknown>).paint
                if (typeof nextPaint === "object" && nextPaint != null) {
                  ;(next as Record<string, unknown>).paint = tint(nextPaint) as Record<string, unknown>
                }
              }
              return next
            })
          }
        }
        setMapStyle(style)
      })
      .catch(() => {
        if (!cancelled) setMapStyle(MAP_STYLE_URL)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => {
    const nums = Object.values(values)
    const max = Math.max(...nums, 1)
    const min = Math.min(...nums, 0)
    return { min, max }
  }, [values])

  const sidebarHeat = useMemo(() => {
    const value = sidebar?.value
    const t = value == null ? 0 : stats.max === 0 ? 0 : value / stats.max
    const { r, g, b } = heatColorGreenToRed(t)
    return {
      fill: `rgba(${r}, ${g}, ${b}, 0.32)`,
      stroke: `rgba(${r}, ${g}, ${b}, 0.95)`,
    }
  }, [sidebar?.value, stats.max])

  const isSidebarOpen = sidebar != null

  const closeSidebar = () => {
    setSidebar(null)
    setSelectedRegionName(null)
    setIsZonesPanelOpen(false)

    // Reset to the initial "front-facing" camera when closing the modal.
    setViewState(() => ({
      ...INITIAL_VIEW_STATE,
      transitionDuration: 650,
      transitionInterpolator: new FlyToInterpolator(),
      transitionEasing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    }))
  }

  const layers = useMemo((): Layer[] => {
    const hoveredFeature =
      hoveredRegionName != null
        ? (geoJsonData.features ?? []).find((f) => getFeatureName(f) === hoveredRegionName) ?? null
        : null
    const selectedFeature =
      selectedRegionName != null
        ? (geoJsonData.features ?? []).find((f) => getFeatureName(f) === selectedRegionName) ?? null
        : null

    const geoJsonLayer = new GeoJsonLayer({
      id: "ethiopia-regions",
      data: geoJsonData,
      pickable: true,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 1,
      getLineColor: [255, 255, 255, 35],
      getLineWidth: 1,
      getFillColor: (f: unknown) => {
        const name = getFeatureName(f)
        const value = values[name]
        if (typeof value !== "number" || !Number.isFinite(value)) return [120, 140, 150, 70]
        const t = stats.max === 0 ? 0 : value / stats.max
        const { r, g, b } = heatColorGreenToRed(t)
        return [r, g, b, 155]
      },
      updateTriggers: {
        getFillColor: [stats.max, values],
      },
    })

    const hoverLayer = new GeoJsonLayer({
      id: "ethiopia-region-hover",
      data: hoveredFeature
        ? ({
            type: "FeatureCollection",
            features: [hoveredFeature],
          } as FeatureCollection<Geometry, GeoJsonProperties>)
        : undefined,
      pickable: false,
      stroked: true,
      filled: true,
      extruded: false,
      wireframe: false,
      opacity: 1,
      getLineColor: [242, 139, 44, 220],
      getLineWidth: 2,
      lineWidthMinPixels: 2,
      getFillColor: [242, 139, 44, 0],
      transitions: {
        getFillColor: { duration: 120 },
      },
      updateTriggers: {
        getFillColor: [hoveredRegionName],
      },
    })

    const highlightLayer = new GeoJsonLayer({
      id: "ethiopia-region-highlight",
      data: selectedFeature
        ? ({
            type: "FeatureCollection",
            features: [selectedFeature],
          } as FeatureCollection<Geometry, GeoJsonProperties>)
        : undefined,
      pickable: false,
      stroked: true,
      filled: true,
      extruded: false,
      wireframe: false,
      opacity: 0.98,
      getLineColor: [255, 255, 255, 110],
      getLineWidth: 2,
      lineWidthMinPixels: 2,
      getFillColor: [242, 139, 44, 190],
      getElevation: (f: unknown) => {
        const name = getFeatureName(f)
        if (!name) return 0
        const value = values[name] ?? 0
        const t = stats.max === 0 ? 0 : value / stats.max
        // "Classic" pop: bigger lift for bigger values.
        return 12000 + Math.round(90000 * t)
      },
      transitions: {
        getElevation: { duration: 700 },
        getFillColor: { duration: 350 },
      },
      updateTriggers: {
        getElevation: [selectedRegionName, stats.max],
        getFillColor: [selectedRegionName],
      },
    })

    const regionNameLayer = new TextLayer({
      id: "ethiopia-region-names",
      data: (geoJsonData.features ?? []) as Feature<Geometry, GeoJsonProperties>[],
      pickable: false,
      getPosition: (f: unknown) => {
        const ll = getFeatureLabelLngLat(f)
        return ll ?? [0, 0]
      },
      getText: (f: unknown) => {
        const name = getFeatureName(f)
        const meta = name ? getEthiopiaRegionMeta(name) : null
        return meta?.name ?? name
      },
      getColor: [255, 255, 255, 210],
      getSize: 11,
      sizeUnits: "pixels",
      sizeMinPixels: 10,
      sizeMaxPixels: 14,
      getTextAnchor: "middle",
      getAlignmentBaseline: "center",
      background: true,
      getBackgroundColor: [0, 0, 0, 110],
      backgroundPadding: [8, 6],
      getPixelOffset: [0, 8],
      fontFamily:
        'Inter Tight, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',

      // Always show all labels (even if they overlap).
      collisionEnabled: false,
    })

    const regionValueLayer = new TextLayer({
      id: "ethiopia-region-values",
      data: (geoJsonData.features ?? []) as Feature<Geometry, GeoJsonProperties>[],
      pickable: false,
      getPosition: (f: unknown) => {
        const ll = getFeatureLabelLngLat(f)
        return ll ?? [0, 0]
      },
      getText: (f: unknown) => {
        const name = getFeatureName(f)
        const value = values[name]
        if (typeof value !== "number") return ""
        return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)
      },
      getColor: [242, 139, 44, 245],
      getSize: 13,
      sizeUnits: "pixels",
      sizeMinPixels: 12,
      sizeMaxPixels: 16,
      fontWeight: 800,
      getTextAnchor: "middle",
      getAlignmentBaseline: "center",
      background: true,
      getBackgroundColor: [0, 0, 0, 110],
      backgroundPadding: [8, 6],
      getPixelOffset: [0, -10],
      fontFamily:
        'Inter Tight, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
      collisionEnabled: false,
    })

    return [geoJsonLayer, hoverLayer, highlightLayer, regionNameLayer, regionValueLayer]
  }, [hoveredRegionName, selectedRegionName, stats.max, values])

  const fitBounds = useMemo(() => computeGeoJsonBounds(geoJsonData), [])

  const computeInitialViewState = useMemo(() => {
    return (width: number, height: number) => {
      if (!fitBounds) return INITIAL_VIEW_STATE

      const { longitude, latitude, zoom } = new WebMercatorViewport({ width, height }).fitBounds(
        fitBounds,
        { padding: 36 }
      )

      return {
        ...INITIAL_VIEW_STATE,
        longitude,
        latitude,
        zoom: Math.min(INITIAL_VIEW_STATE.maxZoom, Math.max(INITIAL_VIEW_STATE.minZoom, zoom)),
      }
    }
  }, [fitBounds])

  const lockedBounds = useMemo(() => {
    if (!fitBounds) return null

    // A little slack so users can pan without immediately "hitting a wall".
    const slackDeg = 0.35
    const [[minLng, minLat], [maxLng, maxLat]] = fitBounds
    return [
      [minLng - slackDeg, minLat - slackDeg],
      [maxLng + slackDeg, maxLat + slackDeg],
    ] satisfies LngLatBounds
  }, [fitBounds])

  const clampViewState = useMemo(() => {
    if (!lockedBounds) return null

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
    const [[minLng, minLat], [maxLng, maxLat]] = lockedBounds

    return (next: typeof INITIAL_VIEW_STATE & { width?: number; height?: number }) => ({
      ...next,
      zoom: clamp(next.zoom, INITIAL_VIEW_STATE.minZoom, INITIAL_VIEW_STATE.maxZoom),
      longitude: clamp(next.longitude, minLng, maxLng),
      latitude: clamp(next.latitude, minLat, maxLat),
      // "Lock" orientation to avoid drifting away from Ethiopia.
      bearing: next.bearing ?? 0,
      pitch: next.pitch ?? INITIAL_VIEW_STATE.pitch,
    })
  }, [lockedBounds])

  useEffect(() => {
    if (!containerRef.current) return

    const el = containerRef.current
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))

      setViewState((prev) => {
        if (prev) return prev
        const next = computeInitialViewState(width, height)
        return clampViewState ? clampViewState(next) : next
      })
    })
    ro.observe(el)

    return () => ro.disconnect()
  }, [clampViewState, computeInitialViewState])

  const handlePickRegion = (info: { object?: unknown } | null | undefined) => {
    if (!info?.object) {
      closeSidebar()
      return
    }

    const name = getFeatureName(info.object)
    if (!name) {
      closeSidebar()
      return
    }

    setSelectedRegionName(name)

    const ll = getFeatureLabelLngLat(info.object)
    if (ll) {
      const [longitude, latitude] = ll
      setViewState((prev) => {
        const base = prev ?? INITIAL_VIEW_STATE
        const next = {
          ...base,
          longitude,
          latitude,
          zoom: Math.max(base.zoom, 6.0),
          pitch: 68,
          bearing: 28,
          transitionDuration: 900,
          transitionInterpolator: new FlyToInterpolator(),
          transitionEasing: (t: number) =>
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
        }
        return clampViewState ? clampViewState(next) : next
      })
    }

    const value = values[name]
    const meta = getEthiopiaRegionMeta(name)
    const displayName = meta?.name ?? name
    const capital = meta?.capital ?? null
    const zone = meta?.zone ?? null

    const valueNumber = typeof value === "number" ? value : null
    const valueText = formatWholeNumber(valueNumber)

    const percentText =
      valueNumber == null ? "—" : `${Math.round((valueNumber / Math.max(1, stats.max)) * 100)}% of max`

    const breakdown = getRegionRandomBreakdown(name, valueNumber)

    setSidebar({
      key: name,
      displayName,
      zone,
      capital,
      geometry:
        typeof info.object === "object" &&
        info.object != null &&
        "geometry" in (info.object as object)
          ? (((info.object as unknown as { geometry?: unknown }).geometry ?? null) as Geometry | null)
          : null,
      value: valueNumber,
      valueText,
      percentText,
      maleText: formatWholeNumber(breakdown.male),
      femaleText: formatWholeNumber(breakdown.female),
      youthReachedText: formatWholeNumber(breakdown.youth),
    })
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-[10px] px-1.5"
      onPointerDown={(e) => {
        // For mouse/trackpad we rely on DeckGL's onClick, which correctly ignores drags.
        // This path exists mainly to make touch taps behave exactly like clicks.
        if (e.pointerType === "mouse") return
        touchDownRef.current = {
          x: e.clientX,
          y: e.clientY,
          pointerId: e.pointerId,
          pointerType: e.pointerType,
        }
      }}
      onPointerUp={(e) => {
        const down = touchDownRef.current
        touchDownRef.current = null
        if (!down) return
        if (e.pointerId !== down.pointerId) return
        if (down.pointerType === "mouse") return

        const dx = e.clientX - down.x
        const dy = e.clientY - down.y
        if (Math.hypot(dx, dy) > 6) return

        const el = containerRef.current
        const deck = deckRef.current?.deck
        const pickObject = deck?.pickObject
        if (!el || typeof pickObject !== "function") return

        const rect = el.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const pickInfo = pickObject({ x, y, radius: 4 })
        handlePickRegion(pickInfo as { object?: unknown })
      }}
    >
      <DeckGL
        ref={deckRef as never}
        viewState={viewState ?? INITIAL_VIEW_STATE}
        controller={{
          dragPan: true,
          scrollZoom: true,
          dragRotate: false,
          touchRotate: false,
          doubleClickZoom: false,
        }}
        layers={layers}
        getCursor={() => (hoveredRegionName ? "pointer" : "grab")}
        onViewStateChange={(e) => {
          const next = (e.viewState ?? INITIAL_VIEW_STATE) as typeof INITIAL_VIEW_STATE & {
            width?: number
            height?: number
          }
          const clamped = clampViewState ? clampViewState(next) : next
          setViewState(clamped)
        }}
        onHover={(info) => {
          const name = info?.object ? getFeatureName(info.object) : ""
          setHoveredRegionName(name || null)
        }}
        onClick={handlePickRegion}
      >
        <Map
          reuseMaps
          attributionControl={false}
          mapStyle={mapStyle as never}
          dragRotate={false}
          maxPitch={60}
        />
      </DeckGL>

      <div
        className={[
          "absolute inset-0 z-30 transition",
          isSidebarOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        aria-hidden={!isSidebarOpen}
      >
        <button
          type="button"
          className={[
            "absolute inset-0 bg-black/25 backdrop-blur-none transition-opacity duration-200",
            isSidebarOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={closeSidebar}
          aria-label="Close region details"
          tabIndex={isSidebarOpen ? 0 : -1}
        />

        <div
          className={[
            "absolute right-3 top-3 flex flex-col items-stretch gap-3",
            "transition-transform duration-250 ease-out will-change-transform",
            isSidebarOpen ? "translate-x-0" : "translate-x-[calc(100%+24px)]",
            "md:right-4 md:top-4 md:flex-row md:items-start",
          ].join(" ")}
        >
          <aside
            className={[
              "w-full max-w-[92vw] overflow-hidden rounded-2xl border border-[color:var(--card-border)] sm:w-[220px]",
              "bg-[color:var(--card)]/90 backdrop-blur-xl shadow-[0_24px_70px_rgba(0,0,0,0.45)]",
              "pointer-events-auto",
              "block",
            ].join(" ")}
            role="dialog"
            aria-modal="false"
            aria-label="Region zone"
          >
            {sidebar ? (
              <div className="p-4">
                <div className="text-[11px] font-semibold tracking-wide text-[color:var(--muted)]">
                  Region zone
                </div>
                <div className="mt-1 text-lg font-semibold text-[color:var(--fg)]">
                  {sidebar.zone ?? "—"}
                </div>

                <div className="mt-3 grid gap-2">
                  <div className="rounded-xl border border-[color:var(--card-border)] bg-[color:var(--surface-2)]/50 p-3">
                    <div className="text-[11px] font-semibold tracking-wide text-[color:var(--muted)]">
                      Total MSME&apos;s
                    </div>
                    <div className="mt-1 text-base font-semibold text-[color:var(--accent)]">
                      {sidebar.valueText}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[color:var(--card-border)] bg-[color:var(--surface-2)]/50 p-3">
                    <div className="text-[11px] font-semibold tracking-wide text-[color:var(--muted)]">
                      Region
                    </div>
                    <div className="mt-1 truncate text-sm font-semibold text-[color:var(--fg)]">
                      {sidebar.displayName}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsZonesPanelOpen(true)}
                  className="mt-4 w-full rounded-xl border border-[color:var(--card-border)] bg-[color:var(--surface-2)]/50 px-3 py-2.5 text-left text-xs font-semibold text-[color:var(--fg)] transition hover:bg-[color:var(--surface-3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                >
                  Zones &amp; sample woredas
                  <span className="ml-2 text-[11px] font-medium text-[color:var(--muted)]">
                    View full list
                  </span>
                </button>
              </div>
            ) : null}
          </aside>

          <aside
            className={[
              "h-[calc(100svh-1.5rem)] max-h-[calc(100%-1.5rem)] w-full max-w-[92vw] overflow-hidden rounded-2xl border border-[color:var(--card-border)] shadow-[0_30px_90px_rgba(0,0,0,0.55)] sm:w-[340px]",
              "bg-[color:var(--card)]/90 backdrop-blur-xl",
              "md:h-[calc(100%-2rem)] md:w-[420px]",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            aria-label="Region details"
          >
            {sidebar ? (
              <div className="m-0 flex h-full w-full flex-col items-center justify-center leading-[9px]">
              <div className="flex w-[325px] items-start justify-between gap-0 border-b border-[color:var(--card-border)] px-[11px] py-3.5">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold tracking-wide text-[color:var(--fg)]">
                    {sidebar.displayName}
                  </div>
                  {sidebar.capital ? (
                    <div className="mt-1 truncate text-xs font-medium text-[color:var(--muted)]">
                      Capital: {sidebar.capital}
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={closeSidebar}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[color:var(--card-border)] bg-[color:var(--surface-2)] text-[color:var(--fg)] transition hover:bg-[color:var(--surface-3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="w-[325px] px-0 pt-0">
                <div className="relative -mx-px overflow-hidden rounded-none border border-[color:var(--card-border)] bg-[color:var(--surface-2)]/40 p-3">
                  <div className="text-[11px] font-semibold tracking-wide text-[color:var(--muted)]">
                    Region map
                  </div>
                  <div className="mt-2 overflow-visible">
                    <svg
                      viewBox="0 0 320 160"
                      className="h-[170px] w-[calc(100%+24px)] -mx-3"
                      aria-label={`${sidebar.displayName} map`}
                      role="img"
                    >
                      <defs>
                        <linearGradient id="regionFill" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="rgba(242,139,44,0.20)" />
                          <stop offset="100%" stopColor="rgba(242,139,44,0.05)" />
                        </linearGradient>
                      </defs>

                      <rect x="0" y="22" width="320" height="116" fill="rgba(0,0,0,0.12)" />
                      <path
                        d={geometryToSvgPath(sidebar.geometry, 320, 160, 14)}
                        fill={sidebarHeat.fill}
                        stroke={sidebarHeat.stroke}
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="px-[17px] pb-0 pt-0">
                <div className="text-xs font-semibold tracking-wide text-[color:var(--muted)]">
                  Total MSME&apos;s
                </div>
                <div className="mt-1 flex flex-wrap items-end gap-3">
                  <div className="min-w-0 text-3xl font-bold tracking-tight text-[color:var(--accent)] sm:mr-auto">
                    {sidebar.valueText}
                  </div>

                  <div className="grid shrink-0 grid-cols-2 gap-2">
                    <div className="rounded-xl border border-[color:var(--card-border)] bg-[color:var(--surface-2)]/50 px-2.5 py-2">
                      <div className="text-[10px] font-semibold tracking-wide text-[color:var(--muted)]">
                        Male
                      </div>
                      <div className="mt-0.5 text-xs font-semibold text-[color:var(--fg)]">
                        {sidebar.maleText}
                      </div>
                    </div>
                    <div className="rounded-xl border border-[color:var(--card-border)] bg-[color:var(--surface-2)]/50 px-2.5 py-2">
                      <div className="text-[10px] font-semibold tracking-wide text-[color:var(--muted)]">
                        Female
                      </div>
                      <div className="mt-0.5 text-xs font-semibold text-[color:var(--fg)]">
                        {sidebar.femaleText}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm font-medium text-[color:var(--muted)]">
                  {sidebar.percentText}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <div className="rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--surface-2)]/50 p-3">
                    <div className="text-[11px] font-semibold tracking-wide text-[color:var(--muted)]">
                      Youth reached
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[color:var(--fg)]">
                      {sidebar.youthReachedText}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto border-t border-[color:var(--card-border)] p-4 text-xs text-[color:var(--muted)]">
                Click another region to update this panel.
              </div>
              </div>
            ) : null}
          </aside>
        </div>

        {sidebar && isZonesPanelOpen ? (
          <div className="absolute inset-0 z-40 pointer-events-auto">
            <button
              type="button"
              className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
              onClick={() => setIsZonesPanelOpen(false)}
              aria-label="Close zones list"
            />

            <aside
              className={[
                "absolute inset-x-3 bottom-3 top-16 overflow-hidden rounded-2xl border border-[color:var(--card-border)] shadow-[0_30px_90px_rgba(0,0,0,0.55)]",
                "bg-[color:var(--card)]/95 backdrop-blur-xl",
                "md:inset-auto md:left-1/2 md:top-1/2 md:h-[min(80vh,760px)] md:w-[min(92vw,720px)] md:-translate-x-1/2 md:-translate-y-1/2",
              ].join(" ")}
              role="dialog"
              aria-modal="true"
              aria-label="Zones & sample woredas"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3 border-b border-[color:var(--card-border)] px-4 py-3.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold tracking-wide text-[color:var(--fg)]">
                      Zones &amp; sample woredas
                    </div>
                    <div className="mt-1 truncate text-xs font-medium text-[color:var(--muted)]">
                      {sidebar.displayName}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsZonesPanelOpen(false)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[color:var(--card-border)] bg-[color:var(--surface-2)] text-[color:var(--fg)] transition hover:bg-[color:var(--surface-3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-auto p-4">
                  {(ethiopiaRegionZonesByKey[sidebar.key] ?? []).length === 0 ? (
                    <div className="rounded-xl border border-[color:var(--card-border)] bg-[color:var(--surface-2)]/50 p-3">
                      <div className="text-xs font-medium text-[color:var(--muted)]">No zone list yet.</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(ethiopiaRegionZonesByKey[sidebar.key] ?? []).map((group) => (
                        <div
                          key={group.label}
                          className="rounded-xl border border-[color:var(--card-border)] bg-[color:var(--surface-2)]/50 p-3"
                        >
                          <div className="text-xs font-semibold text-[color:var(--fg)]">{group.label}</div>
                          <div className="mt-2 grid gap-1">
                            {group.items.map((woreda) => (
                              <div
                                key={woreda}
                                className="flex items-center justify-between gap-3 rounded-lg border border-[color:var(--card-border)] bg-[color:var(--surface-2)]/40 px-2.5 py-2"
                              >
                                <div className="min-w-0 truncate text-[11px] font-medium leading-4 text-[color:var(--muted)]">
                                  {woreda}
                                </div>
                                <div className="shrink-0 rounded-md border border-[color:var(--card-border)] bg-[color:var(--surface-2)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--fg)]">
                                  100,000
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  )
}

