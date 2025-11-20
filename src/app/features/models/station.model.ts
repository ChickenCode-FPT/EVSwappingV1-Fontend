export interface Station {
  stationId: number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  phone?: string;
  status?: number;
  availableBatteries?: number;
  distanceKm?: number;
  durationMin?: number;
}