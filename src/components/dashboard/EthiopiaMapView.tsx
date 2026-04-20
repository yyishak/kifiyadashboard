"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import DeckGL from "@deck.gl/react"
import { GeoJsonLayer, TextLayer } from "@deck.gl/layers"
import { WebMercatorViewport } from "@deck.gl/core"
import type { Layer } from "@deck.gl/core"
import { CollisionFilterExtension } from "@deck.gl/extensions"
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry } from "geojson"
import Map from "react-map-gl/maplibre"

import ethiopiaGeoJson from "@/data/ethiopiaRegions.json"
import { colorRamp } from "@/lib/colors"
import { formatCompact } from "@/lib/format"
import { TooltipCard } from "@/components/dashboard/TooltipCard"
import { RegionPin } from "@/components/dashboard/RegionPin"

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

const geoJsonData = ethiopiaGeoJson as unknown as FeatureCollection<Geometry, GeoJsonProperties>

const getFeatureName = (feature: unknown) => {
  if (typeof feature !== "object" || feature == null) return ""
  const f = feature as RegionFeature
  const name = f.properties?.name
  return `${typeof name === "string" ? name : ""}`.trim()
}

const getFeatureLabelLngLat = (feature: unknown): [number, number] | null => {
  if (typeof feature !== "object" || feature == null) return null
  const f = feature as RegionFeature
  const ll = f.properties?.labelLngLat
  if (Array.isArray(ll) && ll.length >= 2 && typeof ll[0] === "number" && typeof ll[1] === "number") {
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
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number } | null>(null)
  const [mapStyle, setMapStyle] = useState<unknown>(MAP_STYLE_URL)
  const [selected, setSelected] = useState<{
    x: number
    y: number
    title: string
    value: string
  } | null>(null)

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
        if (style && typeof style === "object" && Array.isArray((style as any).layers)) {
          ;(style as any).layers = (style as any).layers.map((layer: any) => {
            const next = { ...layer }
            if (next?.id === "background" && next?.paint) {
              next.paint = { ...next.paint, "background-color": MAP_DARK_TINT }
            }
            if (next?.paint) next.paint = tint(next.paint)
            return next
          })
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

  const regionPins = useMemo(() => {
    if (!viewportSize) return []
    const vs = viewState ?? INITIAL_VIEW_STATE
    const viewport = new WebMercatorViewport({
      width: viewportSize.width,
      height: viewportSize.height,
      longitude: vs.longitude,
      latitude: vs.latitude,
      zoom: vs.zoom,
      bearing: 0,
      pitch: 0,
    })

    return (geoJsonData.features ?? [])
      .map((f) => {
        const name = getFeatureName(f)
        const ll = getFeatureLabelLngLat(f)
        if (!name || !ll) return null
        const raw = values[name]
        const value =
          typeof raw === "number"
            ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(raw)
            : "—"
        const [x, y] = viewport.project(ll)
        return { name, value, x, y }
      })
      .filter(Boolean) as Array<{ name: string; value: string; x: number; y: number }>
  }, [viewState, viewportSize])

  const layers = useMemo((): Layer[] => {
    const geoJsonLayer = new GeoJsonLayer({
      id: "ethiopia-regions",
      data: geoJsonData,
      pickable: true,
      stroked: false,
      filled: false,
      lineWidthMinPixels: 1,
      getLineColor: [255, 255, 255, 35],
      getLineWidth: 1,
      getFillColor: (f: unknown) => {
        const name = getFeatureName(f)
        const value = values[name] ?? 0
        const t = stats.max === 0 ? 0 : value / stats.max
        return colorRamp(t)
      },
      updateTriggers: {
        getFillColor: [stats.max],
      },
    })

    const pillLayer = new TextLayer({
      id: "ethiopia-pills",
      data: (geoJsonData.features ?? []) as Feature<Geometry, GeoJsonProperties>[],
      pickable: false,
      getPosition: (f: unknown) => {
        const feature = f as RegionFeature
        const ll = feature?.properties?.labelLngLat
        return Array.isArray(ll) && ll.length >= 2 && typeof ll[0] === "number" && typeof ll[1] === "number"
          ? [ll[0], ll[1]]
          : [0, 0]
      },
      getText: (f: unknown) => {
        const name = getFeatureName(f)
        const value = values[name]
        if (value == null) return name
        return `${name}\n${formatCompact(value)}`
      },
      getColor: [255, 255, 255, 210],
      getSize: 12,
      sizeUnits: "pixels",
      sizeMinPixels: 11,
      sizeMaxPixels: 16,
      getTextAnchor: "middle",
      getAlignmentBaseline: "center",
      background: false,
      getPixelOffset: [0, -6],
      fontFamily:
        'Inter Tight, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',

      // Avoid overlapping labels (from deck.gl TextLayer example)
      collisionEnabled: true,
      getCollisionPriority: (f: unknown) => {
        const name = getFeatureName(f)
        const value = values[name] ?? 0
        // Prefer showing higher values when space is tight
        return Math.log10(Math.max(1, value + 1))
      },
      collisionTestProps: {
        sizeScale: 24,
        sizeMaxPixels: 120,
        sizeMinPixels: 10,
      },
      extensions: [new CollisionFilterExtension()],
    })

    return [geoJsonLayer, pillLayer]
  }, [stats.max, values])

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
      bearing: 0,
      pitch: INITIAL_VIEW_STATE.pitch,
    })
  }, [lockedBounds])

  useEffect(() => {
    if (!containerRef.current) return

    const el = containerRef.current
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      setViewportSize({ width, height })

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
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
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
        onViewStateChange={(e) => {
          const next = (e.viewState ?? INITIAL_VIEW_STATE) as typeof INITIAL_VIEW_STATE & {
            width?: number
            height?: number
          }
          const clamped = clampViewState ? clampViewState(next) : next
          setViewState(clamped)
        }}
        onClick={(info) => {
          if (!info?.object) {
            setSelected(null)
            return
          }

          const name = getFeatureName(info.object)
          const value = values[name]
          const title = name || "Region"
          const valueText =
            value == null
              ? "—"
              : `${formatCompact(value)} (${Math.round((value / Math.max(1, stats.max)) * 100)}%)`

          setSelected({
            x: info.x ?? 0,
            y: info.y ?? 0,
            title,
            value: valueText,
          })
        }}
      >
        <Map
          reuseMaps
          attributionControl={false}
          mapStyle={mapStyle as never}
          dragRotate={false}
          maxPitch={0}
        />
      </DeckGL>

      {regionPins.map((p) => (
        <div
          key={p.name}
          className="pointer-events-none absolute left-0 top-0 z-20"
          style={{
            transform: `translate(${Math.round(p.x - 94)}px, ${Math.round(p.y - 98)}px)`,
          }}
        >
          <RegionPin
            label={p.name}
            value={p.value}
            className="h-[66px] w-[128px] drop-shadow-[0_10px_35px_rgba(0,0,0,0.35)]"
          />
        </div>
      ))}

      {selected ? (
        <div
          className="absolute left-0 top-0 z-30"
          style={{
            transform: `translate(${Math.max(0, selected.x + 12)}px, ${Math.max(0, selected.y + 12)}px)`,
          }}
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border border-white/20 bg-[#02404F] text-xs text-white shadow-[0_10px_35px_rgba(0,0,0,0.35)]"
              aria-label="Close region details"
            >
              ×
            </button>
            <TooltipCard title={selected.title} value={selected.value} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

