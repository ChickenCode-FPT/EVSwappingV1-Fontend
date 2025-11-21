// src\app\features\battery-model\models\battery-model.model.ts
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
