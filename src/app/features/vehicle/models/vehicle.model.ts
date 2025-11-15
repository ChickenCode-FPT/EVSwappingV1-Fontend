import { BatteryModel } from "../../models/batteryModel.model";

// src\app\features\vehicle\models\vehicle.model.ts
export interface Vehicle {
  vehicleId: number;
  userId: string;
  vin: string;
  make: string;
  model: string;
  year?: number;
  batteryModelPreferenceId?: number | null;
    batteryModel?: BatteryModel | null;
}

export interface CreateVehicleRequest {
  vin: string;
  make: string;
  model: string;
  year?: number;
  batteryModelPreferenceId?: number | null;
}

export interface UpdateVehicleRequest {
  vehicleId: number;
  vin: string;
  make: string;
  model: string;
  year?: number;
  batteryModelPreferenceId?: number | null;
}
