// src\app\features\station\models\station.types.ts
export interface NearestStationResponse {
  stations: {
    id: number;
    name: string;
    coords: [number, number];
    distance: number; // meters
    duration: number; // seconds
  }[];
  nearestIndex: number;
}
