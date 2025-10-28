// src\app\features\station\services\map.service.ts
import { Injectable } from '@angular/core';
import {
  ROUTE_LAYER_ID,
  ROUTE_SOURCE_ID,
  DRIVER_MARKER_COLOR,
  STATION_MARKER_COLOR,
} from '../constants/map.constants';

@Injectable({ providedIn: 'root' })
export class MapService {
  private mapboxgl: any;

  async loadMapbox(): Promise<any> {
    if (this.mapboxgl) return this.mapboxgl;
    this.mapboxgl = (await import('mapbox-gl')).default;
    return this.mapboxgl;
  }

  createMap(
    mapboxgl: any,
    options: { container: string; style: any; center: [number, number]; zoom: number }
  ): any {
    return new mapboxgl.Map(options);
  }

  addOrUpdateRoute(map: any, geojson: GeoJSON.Feature<GeoJSON.LineString>) {
    if (!map || !geojson) return;

    if (!map.isStyleLoaded()) {
      map.once('styledata', () => this.addOrUpdateRoute(map, geojson));
      return;
    }

    const existingSource = map.getSource(ROUTE_SOURCE_ID);
    if (existingSource) {
      (existingSource as any).setData(geojson);
    } else {
      map.addSource(ROUTE_SOURCE_ID, {
        type: 'geojson',
        data: geojson,
      });

      map.addLayer({
        id: ROUTE_LAYER_ID,
        type: 'line',
        source: ROUTE_SOURCE_ID,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-width': 4,
          'line-color': '#22c55e',
        },
      });
    }
  }

  clearRoute(map: any) {
    if (!map) return;
    if (map.getLayer(ROUTE_LAYER_ID)) map.removeLayer(ROUTE_LAYER_ID);
    if (map.getSource(ROUTE_SOURCE_ID)) map.removeSource(ROUTE_SOURCE_ID);
  }

  createMarker(mapboxgl: any, color: string, coords: [number, number], popupHtml?: string) {
    const marker = new mapboxgl.Marker({ color }).setLngLat(coords);
    if (popupHtml) marker.setPopup(new mapboxgl.Popup().setHTML(popupHtml));
    return marker;
  }

  colors = {
    driver: DRIVER_MARKER_COLOR,
    station: STATION_MARKER_COLOR,
  };
}
