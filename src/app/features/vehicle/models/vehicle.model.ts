export interface Vehicle {
  vehicleId: number;
  userId: string;
  vin: string;
  make: string;
  model: string;
  year?: number;
  batteryModelPreferenceId?: number | null;
}
