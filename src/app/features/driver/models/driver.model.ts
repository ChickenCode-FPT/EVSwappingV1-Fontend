export interface RegisterDriverRequest {
  preferredPaymentMethod: string;
}

export interface RegisterDriverResponse {
  userId: string;
  driverId: number;
  preferredPaymentMethod: string;
  createdAt: string;
}
