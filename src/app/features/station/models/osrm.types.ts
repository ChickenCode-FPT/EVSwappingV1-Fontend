// src/app/features/station/models/osrm.types.ts
export type VehicleProfile = 'car' | 'motorbike' | 'truck';

export interface RouteResponse {
  code: string;
  routes: {
    distance: number;
    duration: number;
    geometry: string; // encoded polyline
  }[];
  waypoints: any[];
}
