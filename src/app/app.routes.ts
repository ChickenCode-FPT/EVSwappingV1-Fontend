// src\app\app.routes.ts
import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { LoginComponent } from './features/auth/login/login';
import { GoogleCallbackComponent } from './features/auth/login/google-callback';
import { RegisterComponent } from './features/auth/register/register';
import { AdminDashboardComponent } from './features/admin/dashboard/admindashboard';
import { Component } from '@angular/core';
import { UsersComponent } from './features/admin/users/users';
import { UpdatePhoneComponent } from './features/auth/updatephonenumber/updatephone';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password';
import { Setup2FAComponent } from './features/auth/setup-2fa/setup-2fa';
import { TwoFactorComponent } from './features/auth/two-factor/two-factor';
import { Disable2FAComponent } from './features/auth/disable-two-factor/disable-two-factor';
import { MapComponent } from './features/station/components/map.component';
import { ReservationsPageComponent } from './features/reservations/pages/reservations-page/reservations-page.component';
import { PromoteUserComponent } from './features/admin/promote-user/promote-user';
import { BatteryHealthLogsComponent } from './features/admin/battery-health-log/battery-health';
import { AssignStationStaffComponent } from './features/admin/station-staff/assign-station-staff';
import { StationStaffListComponent } from './features/admin/station-staff-list/station-staff-list';
import { StaffDashboard } from './features/staff/staff-dashboard/staff-dashboard';
import { BatteryWarehouse } from './features/staff/battery-warehouse/battery-warehouse';
import { BatteryAdd } from './features/staff/battery-add/battery-add';
import { BatteryModels } from './features/staff/battery-model/battery-model';
import { BatteryTransaction } from './features/staff/battery-transaction/battery-transaction';
import { BatteryTransactionDetail } from './features/staff/battery-transaction-detail/battery-transaction-detail';
import { CustomerGuard } from './core/customer.guard';
import { PaymentListComponent } from './features/payment/pages/payment-list/payment-list.component';

@Component({ template: '<h2>About Page</h2>', standalone: true })
export class About {}

@Component({ template: '<h2>Contact Page</h2>', standalone: true })
export class Contact {}

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'login', component: LoginComponent },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'register', component: RegisterComponent },

  // Admin
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'admin/users/list', component: UsersComponent },
  { path: 'admin/users/promote', component: PromoteUserComponent },
  { path: 'admin/users/battery-health', component: BatteryHealthLogsComponent },
  { path: 'admin/users/assign-staff', component: AssignStationStaffComponent },
  { path: 'admin/users/list-station-staff', component: StationStaffListComponent },

  // Auth extra
  { path: 'update-phone', component: UpdatePhoneComponent },
  { path: 'google-callback', component: GoogleCallbackComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '2fa-setup', component: Setup2FAComponent },
  { path: 'two-factor', component: TwoFactorComponent },
  { path: 'disable-2fa', component: Disable2FAComponent },

  // Customer features
  { path: 'station', component: MapComponent, canActivate: [CustomerGuard] },
  { path: 'reservations', component: ReservationsPageComponent, canActivate: [CustomerGuard] },
  { path: 'payments', component: PaymentListComponent, canActivate: [CustomerGuard] },

  // Driver
  {
    path: 'driver/register',
    loadComponent: () =>
      import('./features/driver/driver-register/driver-register.component').then(
        (m) => m.DriverRegisterComponent
      ),
    canActivate: [CustomerGuard],
  },

  // Vehicles
  {
    path: 'vehicles',
    loadComponent: () =>
      import('./features/vehicle/pages/vehicle-list/vehicle-list.component').then(
        (m) => m.VehicleListComponent
      ),
    canActivate: [CustomerGuard],
  },
  {
    path: 'vehicles/add',
    loadComponent: () =>
      import('./features/vehicle/pages/vehicle-add/vehicle-add.component').then(
        (m) => m.VehicleAddComponent
      ),
    canActivate: [CustomerGuard],
  },
  {
    path: 'vehicles/edit/:id',
    loadComponent: () =>
      import('./features/vehicle/pages/vehicle-edit/vehicle-edit.component').then(
        (m) => m.VehicleEditComponent
      ),
    canActivate: [CustomerGuard],
  },

  // Staff
  {
    path: 'staff',
    component: StaffDashboard,
    children: [
      { path: '', redirectTo: 'warehouse', pathMatch: 'full' },
      { path: 'dashboard', component: BatteryWarehouse },
      { path: 'battery/warehouse', component: BatteryWarehouse },
      { path: 'battery/add', component: BatteryAdd },
      { path: 'battery/model', component: BatteryModels },
      { path: 'battery/transaction', component: BatteryTransaction },
      { path: 'battery/transaction/:id', component: BatteryTransactionDetail },
      {
        path: 'transactions/confirm/:id',
        component: BatteryTransactionDetail,
        data: { mode: 'confirm' },
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
