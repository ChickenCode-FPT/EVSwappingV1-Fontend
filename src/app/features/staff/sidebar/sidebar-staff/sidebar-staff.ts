import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../core/auth.service';

@Component({
  selector: 'app-sidebar-staff',
  imports: [CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule],
  templateUrl: './sidebar-staff.html',
  styleUrl: './sidebar-staff.css'
})
export class SidebarStaff {
  menuItems = [
    // { label: 'Dashboard', icon: 'dashboard', path: '/staff/dashboard' },
    { label: 'Battery Warehouse', icon: 'inventory_2', path: '/staff/battery/warehouse' },
    { label: 'Add Battery', icon: 'add_circle', path: '/staff/battery/add' },
    { label: 'Battery Models', icon: 'memory', path: '/staff/battery/model' },
    { label: 'Battery Transaction', icon: 'sync_alt', path: '/staff/battery/transaction' },
    { label: 'Inter-Station Transfers', icon: 'compare_arrows', path: '/staff/inter/transfers' },
    { label: 'Profile', icon: 'person', path: '/staff/profile' },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
