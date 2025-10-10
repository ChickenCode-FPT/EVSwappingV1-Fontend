import { Routes } from '@angular/router';
// ...existing code...
import { Home } from './features/home/home';
import { LoginComponent } from './features/auth/login/login';
import { GoogleCallbackComponent } from './features/auth/login/google-callback';
import { RegisterComponent } from './features/auth/register/register';
import { AdminDashboardComponent } from './features/admin/dashboard/admindashboard';
// Dummy components for missing routes (replace with real ones later)
import { Component } from '@angular/core';
import { UsersComponent } from './features/admin/users/users';
import { UpdatePhoneComponent } from './features/auth/updatephonenumber/updatephone';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password';
import { Setup2FAComponent } from './features/auth/setup-2fa/setup-2fa';
import { TwoFactorComponent } from './features/auth/two-factor/two-factor';
import { Disable2FAComponent } from './features/auth/disable-two-factor/disable-two-factor';
import { MapComponent } from './features/station/components/map.component';
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
    { path: 'admin/dashboard', component: AdminDashboardComponent },
    { path: 'admin/users', component: UsersComponent },
    { path: 'update-phone', component: UpdatePhoneComponent },
    { path: 'google-callback', component: GoogleCallbackComponent },
    { path: 'forgot-password', component:ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent}, 
    { path: '2fa-setup', component: Setup2FAComponent}, 
    { path: 'two-factor', component: TwoFactorComponent},
    { path: 'disable-2fa', component: Disable2FAComponent },
    { path: 'map', component: MapComponent }
];