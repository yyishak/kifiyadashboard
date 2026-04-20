"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import DeckGL from "@deck.gl/react"
import { GeoJsonLayer, TextLayer } from "@deck.gl/layers"
import { WebMercatorViewport } from "@deck.gl/core"
import type { Layer } from "@deck.gl/core"
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry } from "geojson"
import Map from "react-map-gl/maplibre"

import ethiopiaGeoJson from "@/data/ethiopiaRegions.json"
import { colorRamp } from "@/lib/colors"
import { formatCompact } from "@/lib/format"
import { TooltipCard } from "@/components/dashboard/TooltipCard"

type Props = {
  valuesByRegion?: Record<string, number>
}

const INITIAL_VIEW_STATE = {
  longitude: 40.0,
  latitude: 8.7,
  zoom: 4.6,
  minZoom: 4.2,
  maxZoom: 8,
  pitch: 30,
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
  const [hovered, setHovered] = useState<{
    x: number
    y: number
    title: string
    value: string
  } | null>(null)

  const values = useMemo(
    () => props.valuesByRegion ?? {},
    [props.valuesByRegion]
  )

  const stats = useMemo(() => {
    const nums = Object.values(values)
    const max = Math.max(...nums, 1)
    const min = Math.min(...nums, 0)
    return { min, max }
  }, [values])

  const layers = useMemo((): Layer[] => {
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
      getColor: [8, 35, 41, 255],
      getSize: 12,
      sizeUnits: "pixels",
      sizeMinPixels: 11,
      sizeMaxPixels: 16,
      getTextAnchor: "middle",
      getAlignmentBaseline: "center",
      background: true,
      getBackgroundColor: [255, 255, 255, 245],
      backgroundPadding: [10, 7],
      getPixelOffset: [0, -6],
      fontFamily:
        'Inter Tight, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
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
        onHover={(info) => {
          if (!info?.object) {
            setHovered(null)
            return
          }

          const name = getFeatureName(info.object)
          const value = values[name]
          const title = name || "Region"
          const valueText = value == null ? "—" : formatCompact(value)

          // Pin to cursor within the map container. No backdrop/overlay.
          setHovered({
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
          mapStyle="https://demotiles.maplibre.org/style.json"
        />
      </DeckGL>

      {hovered ? (
        <div
          className="pointer-events-none absolute left-0 top-0 z-20"
          style={{
            transform: `translate(${Math.max(0, hovered.x + 12)}px, ${Math.max(0, hovered.y + 12)}px)`,
          }}
        >
          <TooltipCard title={hovered.title} value={hovered.value} />
        </div>
      ) : null}
    </div>
  )
}

