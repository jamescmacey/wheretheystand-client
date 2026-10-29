/**
 * GeoJSON and bounds helpers, shared by every map on the site.
 *
 * These were written inline in `pages/electorates/[id].vue` for the boundary
 * map. The voting places map needs the same bounds arithmetic, and the
 * antimeridian handling in particular is not something to write twice: New
 * Zealand straddles 180°, so a naive bounding box over a shape or a set of
 * points that includes the Chathams spans the long way round the globe and
 * fits the map to the Atlantic.
 */

/** `[[west, south], [east, north]]`, as Mapbox takes it. */
export type LngLatBounds = [[number, number], [number, number]]

/** Centre of New Zealand, for a map with nothing to fit to yet. */
export const NZ_FALLBACK_CENTRE: [number, number] = [172.6, -41.2]

/** Shows both main islands and, just, the Chathams. */
export const NZ_FALLBACK_ZOOM = 4.5

/**
 * The furthest a reader can pan, in unwrapped longitude.
 *
 * East of 180 rather than negative, so the rectangle covers the Chathams
 * (about 183.5 unwrapped) without wrapping. `fitBounds` and `maxBounds` both
 * accept longitudes beyond 180.
 */
export const NZ_MAX_BOUNDS: LngLatBounds = [[164, -48.5], [185, -32]]

type GeoJsonFeatures = GeoJSON.FeatureCollection['features']

type GeoJsonLike = {
  type?: string
  features?: unknown[]
  geometries?: unknown[]
  geometry?: { coordinates?: unknown }
  coordinates?: unknown
}

/**
 * Coerce whatever a boundary file holds into a FeatureCollection.
 *
 * The uploader writes single-feature collections, but the source files are
 * `GeometryCollection`s and nothing stops a future one being a bare geometry,
 * so all four shapes are accepted. Returns null rather than throwing: a map
 * that cannot draw is a warning, not an error page.
 */
export function normaliseGeoJson(input: unknown): GeoJSON.FeatureCollection | null {
  let geojson = input

  if (typeof geojson === 'string') {
    try {
      geojson = JSON.parse(geojson)
    } catch {
      return null
    }
  }

  if (!geojson || typeof geojson !== 'object') return null

  const candidate = geojson as GeoJsonLike
  if (!candidate.type) return null

  if (candidate.type === 'FeatureCollection') {
    return candidate as unknown as GeoJSON.FeatureCollection
  }

  if (candidate.type === 'Feature') {
    return {
      type: 'FeatureCollection',
      features: [candidate as unknown as GeoJSON.Feature],
    }
  }

  if (candidate.type === 'GeometryCollection' && Array.isArray(candidate.geometries)) {
    return {
      type: 'FeatureCollection',
      features: candidate.geometries.map(geometry => ({
        type: 'Feature',
        properties: {},
        geometry,
      })) as GeoJsonFeatures,
    }
  }

  if (candidate.coordinates) {
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: candidate,
      }] as GeoJsonFeatures,
    }
  }

  return null
}

/**
 * The bounding box of every coordinate in a GeoJSON object.
 *
 * Where the shape is narrower measured across the antimeridian than measured
 * the direct way, the eastern edge is returned unwrapped (greater than 180).
 * That is what makes a Chathams electorate, or a result set spanning the
 * country, fit to New Zealand rather than to the whole Pacific.
 */
export function boundsFromGeoJson(geojson: unknown): LngLatBounds | null {
  const coords: Array<[number, number]> = []

  const collect = (value: unknown): void => {
    if (!Array.isArray(value)) return
    if (typeof value[0] === 'number' && typeof value[1] === 'number') {
      coords.push([value[0], value[1]])
      return
    }
    value.forEach(collect)
  }

  const candidate = geojson as GeoJsonLike | null

  if (candidate?.type === 'FeatureCollection' && Array.isArray(candidate.features)) {
    candidate.features.forEach((feature) => {
      collect((feature as GeoJsonLike)?.geometry?.coordinates)
    })
  } else if (candidate?.type === 'Feature') {
    collect(candidate.geometry?.coordinates)
  } else if (candidate?.type && candidate.coordinates) {
    collect(candidate.coordinates)
  }

  return boundsFromCoordinates(coords)
}

/**
 * The bounding box of a list of `[lng, lat]` pairs, with the same
 * antimeridian handling as `boundsFromGeoJson`.
 *
 * Takes points rather than GeoJSON so the voting places map can compute bounds
 * straight from search hits without building a FeatureCollection first.
 */
export function boundsFromCoordinates(
  coords: Array<[number, number]>,
): LngLatBounds | null {
  if (!coords.length) return null

  let minLng = coords[0]![0]
  let minLat = coords[0]![1]
  let maxLng = coords[0]![0]
  let maxLat = coords[0]![1]

  for (const [lng, lat] of coords) {
    minLng = Math.min(minLng, lng)
    minLat = Math.min(minLat, lat)
    maxLng = Math.max(maxLng, lng)
    maxLat = Math.max(maxLat, lat)
  }

  const directSpan = maxLng - minLng
  const wrapped = coords.map(([lng]) => (lng < 0 ? lng + 360 : lng))
  const wrappedMin = Math.min(...wrapped)
  const wrappedMax = Math.max(...wrapped)

  if (wrappedMax - wrappedMin < directSpan) {
    return [[wrappedMin, minLat], [wrappedMax, maxLat]]
  }

  return [[minLng, minLat], [maxLng, maxLat]]
}

/** Whether a box is one `maxBounds` cannot express as a tight rectangle. */
export function crossesAntimeridian(bounds: LngLatBounds): boolean {
  const [[minLng], [maxLng]] = bounds
  return minLng < -180 || maxLng > 180 || (maxLng - minLng) > 180
}

/**
 * Grow a box so the reader can pan a little beyond what they asked to see.
 *
 * A box crossing the antimeridian is widened to the world instead, with
 * latitude still held tight: `maxBounds` takes a plain rectangle and there is
 * no rectangle in −180..180 that contains both Wellington and the Chathams.
 */
export function paddedBounds(
  bounds: LngLatBounds,
  factor = 0.6,
  minLngPad = 0.8,
  minLatPad = 0.6,
): LngLatBounds {
  const [[minLng, minLat], [maxLng, maxLat]] = bounds
  const lngPad = Math.max((maxLng - minLng) * factor, minLngPad)
  const latPad = Math.max((maxLat - minLat) * factor, minLatPad)

  if (crossesAntimeridian(bounds)) {
    return [[-180, minLat - latPad], [180, maxLat + latPad]]
  }

  return [
    [minLng - lngPad, minLat - latPad],
    [maxLng + lngPad, maxLat + latPad],
  ]
}
