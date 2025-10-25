export interface Battery {
  batteryId: number;
  serialNumber: string;
  batteryModelId: number;
  currentSoH: number;
  cycleCount: number;
  status: string;
  lastMaintenance: string;
  createdAt: string;

  batteryModel: {
    batteryModelId: number;
    modelCode: string;
    manufacturer: string;
    capacityKwh: number;
    chemistry: string;
    compatibleVehicleTypes: string;
  };
}

export interface BatteriesDto {
  batteryId: number;
  serialNumber: string;
  batteryModelId: number;
  currentSoH: number | null;
  cycleCount: number | null;
  status: string;
  lastMaintenance: Date | null;
  createdAt: Date;
  batteryModel: BatteryModelDto;
}

export interface BatteryModelDto {
  batteryModelId: number;
  modelCode: string;
  manufacturer: string;
  capacityKwh: number;
  chemistry: string;
  compatibleVehicleTypes: string;
}
