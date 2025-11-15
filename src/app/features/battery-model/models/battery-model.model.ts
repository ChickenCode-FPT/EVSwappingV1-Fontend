export interface BatteryModel {
  batteryModelId: number;
  modelCode: string;
  manufacturer: string;
  capacityKwh: number;
  chemistry: string;
  compatibleVehicleTypes: string;
  reservationDepositFee: number;
  createdAt: string;
}
