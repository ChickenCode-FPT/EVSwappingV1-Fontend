// src/app/map/utils/map-utils.ts
import * as polyline from '@mapbox/polyline';

export function decodePolyline(encoded: string): [number, number][] {
  return polyline.decode(encoded).map((c: [number, number]) => [c[1], c[0]]);
}

export function buildRouteGeoJson(coords: [number, number][]) {
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: coords },
  } as GeoJSON.Feature<GeoJSON.LineString>;
}
