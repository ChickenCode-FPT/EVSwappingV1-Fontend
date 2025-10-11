export interface BatteryDto {
  batteryId: number;
  serialNumber: string;
  status: string;          // "Full" | "Held" | ...
  currentSoH?: number | null;
  cycleCount?: number | null;
  batteryModelId: number;
}
