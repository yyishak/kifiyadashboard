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
  capital: string | null
  geometry: Geometry | null
  value: number | null
  valueText: string
  percentText: string
}

type GeometryBounds = { minX: number; minY: number; maxX: number; maxY: number }

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
  const [viewState, setViewState] = useState<
    (typeof INITIAL_VIEW_STATE & { width?: number; height?: number }) | null
  >(null)
  const [mapStyle, setMapStyle] = useState<unknown>(MAP_STYLE_URL)
  const [selectedRegionName, setSelectedRegionName] = useState<string | null>(null)
  const [sidebar, setSidebar] = useState<RegionSidebarData | null>(null)
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

  const isSidebarOpen = sidebar != null

  const closeSidebar = () => {
    setSidebar(null)
    setSelectedRegionName(null)

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
      stroked: false,
      filled: true,
      lineWidthMinPixels: 1,
      getLineColor: [255, 255, 255, 5],
      getLineWidth: 1,
      getFillColor: (f: unknown) => {
        const name = getFeatureName(f)
        void values[name]
        return [0, 0, 0, 0]
      },
      updateTriggers: {
        getFillColor: [stats.max],
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

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden rounded-[10px] px-1.5">
      <DeckGL
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
        onClick={(info) => {
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
                pitch: 48,
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

          const valueNumber = typeof value === "number" ? value : null
          const valueText =
            valueNumber == null
              ? "—"
              : new Intl.NumberFormat("en-US", {
                  maximumFractionDigits: 0,
                }).format(valueNumber)

          const percentText =
            valueNumber == null
              ? "—"
              : `${Math.round((valueNumber / Math.max(1, stats.max)) * 100)}% of max`

          setSidebar({
            key: name,
            displayName,
            capital,
            geometry:
              typeof info.object === "object" &&
              info.object != null &&
              "geometry" in (info.object as object)
                ? (((info.object as unknown as { geometry?: unknown }).geometry ??
                    null) as Geometry | null)
                : null,
            value: valueNumber,
            valueText,
            percentText,
          })
        }}
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
            "absolute inset-0 bg-black/25 backdrop-blur-sm transition-opacity duration-200",
            isSidebarOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={closeSidebar}
          aria-label="Close region details"
          tabIndex={isSidebarOpen ? 0 : -1}
        />

        <aside
          className={[
            "absolute right-3 top-3 h-[calc(100%-1.5rem)] w-[340px] max-w-[92vw] overflow-hidden rounded-2xl border border-[color:var(--card-border)] shadow-[0_30px_90px_rgba(0,0,0,0.55)]",
            "bg-[color:var(--card)]/90 backdrop-blur-xl",
            "transition-transform duration-250 ease-out will-change-transform",
            isSidebarOpen ? "translate-x-0" : "translate-x-[calc(100%+24px)]",
            "md:right-4 md:top-4 md:h-[calc(100%-2rem)] md:w-[420px]",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
          aria-label="Region details"
        >
          {sidebar ? (
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3 border-b border-[color:var(--card-border)] p-4">
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

              <div className="px-4 pt-4">
                <div className="overflow-hidden rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--surface-2)]/40 p-3">
                  <div className="text-[11px] font-semibold tracking-wide text-[color:var(--muted)]">
                    Region map
                  </div>
                  <div className="mt-2">
                    <svg
                      viewBox="0 0 320 160"
                      className="h-[160px] w-full"
                      aria-label={`${sidebar.displayName} map`}
                      role="img"
                    >
                      <defs>
                        <linearGradient id="regionFill" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="rgba(242,139,44,0.20)" />
                          <stop offset="100%" stopColor="rgba(242,139,44,0.05)" />
                        </linearGradient>
                      </defs>

                      <rect x="0" y="0" width="320" height="160" fill="rgba(0,0,0,0.12)" />
                      <path
                        d={geometryToSvgPath(sidebar.geometry, 320, 160, 14)}
                        fill="url(#regionFill)"
                        stroke="rgba(242,139,44,0.95)"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="text-xs font-semibold tracking-wide text-[color:var(--muted)]">
                  Total MSME&apos;s
                </div>
                <div className="mt-1 text-3xl font-bold tracking-tight text-[color:var(--accent)]">
                  {sidebar.valueText}
                </div>
                <div className="mt-2 text-sm font-medium text-[color:var(--muted)]">
                  {sidebar.percentText}
                </div>
              </div>

              <div className="mt-auto border-t border-[color:var(--card-border)] p-4 text-xs text-[color:var(--muted)]">
                Click another region to update this panel.
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}

