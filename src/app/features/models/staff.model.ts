export interface StaffDto {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  fId: string | null;
  roles: string[];
  lockout: boolean;
}

export interface StaffUpdateDto {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  fId: string | null;
}