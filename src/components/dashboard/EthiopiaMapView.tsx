"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import DeckGL from "@deck.gl/react"
import { GeoJsonLayer, TextLayer } from "@deck.gl/layers"
import { WebMercatorViewport } from "@deck.gl/core"
import { Map } from "react-map-gl/maplibre"
import maplibregl from "maplibre-gl"

import ethiopiaGeoJson from "@/data/ethiopiaRegions.json"
import { colorRamp } from "@/lib/colors"
import { formatCompact } from "@/lib/format"

type Props = {
  mapStyle?: string
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

const getFeatureName = (feature: any) => `${feature?.properties?.name ?? ""}`.trim()

type LngLatBounds = [[number, number], [number, number]]

const computeGeoJsonBounds = (geojson: any): LngLatBounds | null => {
  const coords: any[] = []
  const pushCoords = (c: any) => {
    if (!c) return
    if (typeof c[0] === "number" && typeof c[1] === "number") {
      coords.push(c)
      return
    }
    for (const child of c) pushCoords(child)
  }

  const features = geojson?.features ?? []
  for (const f of features) pushCoords(f?.geometry?.coordinates)
  if (coords.length === 0) return null

  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity
  for (const [lng, lat] of coords) {
    if (typeof lng !== "number" || typeof lat !== "number") continue
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
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number } | null>(
    null
  )

  useEffect(() => {
    if (!containerRef.current) return

    const el = containerRef.current
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      setViewportSize({ width, height })
    })
    ro.observe(el)

    return () => ro.disconnect()
  }, [])

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

  const layers = useMemo(() => {
    const geoJsonLayer = new GeoJsonLayer({
      id: "ethiopia-regions",
      data: ethiopiaGeoJson as any,
      pickable: false,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 1,
      getLineColor: [255, 255, 255, 35],
      getLineWidth: 1,
      getFillColor: (f: any) => {
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
      data: (ethiopiaGeoJson as any).features,
      pickable: false,
      getPosition: (f: any) => f?.properties?.labelLngLat ?? [0, 0],
      getText: (f: any) => {
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

  const fitBounds = useMemo(() => computeGeoJsonBounds(ethiopiaGeoJson as any), [])

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <DeckGL
        initialViewState={(() => {
          if (!fitBounds || !viewportSize) return INITIAL_VIEW_STATE as any

          const { longitude, latitude, zoom } = new WebMercatorViewport({
            width: viewportSize.width,
            height: viewportSize.height,
          }).fitBounds(fitBounds, { padding: 36 })

          return {
            ...INITIAL_VIEW_STATE,
            longitude,
            latitude,
            zoom: Math.min(INITIAL_VIEW_STATE.maxZoom, Math.max(INITIAL_VIEW_STATE.minZoom, zoom)),
          } as any
        })()}
        controller={{ dragPan: true, dragRotate: true, scrollZoom: true }}
        layers={layers as any}
      >
        <Map
          reuseMaps
          mapLib={maplibregl as any}
          mapStyle={
            props.mapStyle ??
            "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
          }
          attributionControl={false}
        />
      </DeckGL>
    </div>
  )
}

