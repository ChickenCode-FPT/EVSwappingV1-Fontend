// src\app\features\station\models\station.model.ts
export interface Station {
  stationId: number;
  name: string;
  address: string;
  longitude: number;
  latitude: number;
  capacity: number;
  phone: string;
  status: number;
  availableBatteries: number;
  distanceKm?: number;
  durationMin?: number;
  coords: [number, number];
  marker?: any;
}
