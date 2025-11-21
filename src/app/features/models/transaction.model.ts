// src/app/features/models/transaction.model.ts
export interface TransactionFull {
  swapTransactionId: number;
  reservationId: number;
  stationId: number;
  customerUserId: string;
  customerName: string;

  staffUserId: string;
  staffName?: string;            

  outgoingBatteryId: number;
  incomingBatteryId: number;
  swapStartedAt: string;
  swapFinishedAt: string;
  swapStatus: string;
  price: number;
  notes: string;
  createdAt: string;

  station: {
    stationId: number;
    name: string;
    address: string;
    phone?: string;              
  };

  reservation: {
    reservationId: number;
    reservedFrom: string;
    reservedTo: string;
    status: string;
  };

  payment?: {
    paymentId: number;
    amount: number;
    method: string;
    status: string;
  };
}
