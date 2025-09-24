import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidenar';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent {
  stats = [
    { title: 'Users', value: 123, icon: '👤', color: '#4CAF50' },
    { title: 'Orders', value: 56, icon: '🛒', color: '#2196F3' },
    { title: 'Revenue', value: '$12K', icon: '💰', color: '#FF9800' }
  ];
}
