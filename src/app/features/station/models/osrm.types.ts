// src/app/map/models/osrm.types.ts
export interface RouteResponse {
  code: string;
  routes: {
    distance: number;
    duration: number;
    geometry: string; // encoded polyline
  }[];
  waypoints: any[];
}
