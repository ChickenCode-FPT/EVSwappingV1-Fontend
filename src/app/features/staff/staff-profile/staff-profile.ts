import { Component, OnInit } from '@angular/core';
import { StaffService } from '../services/staff.service';
import { StaffDto } from '../../models/staff.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-staff-profile',
  imports: [],
  templateUrl: './staff-profile.html',
  styleUrl: './staff-profile.css',
})
export class StaffProfile implements OnInit {
  staff!: StaffDto;
  loading = true;

  constructor(
    private staffService: StaffService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = localStorage.getItem('userId');

    if (!id) {
      console.warn('No user ID found in localStorage');
      this.router.navigate(['/login']);
      return;
    }

    this.staffService.getStaffProfile(id).subscribe({
      next: (res) => {
        this.staff = res;
        this.loading = false;

        if (!this.staff.fId) {
          return;
        }
      },
      error: (err) => {
        console.error('Error loading staff profile:', err);
        this.loading = false;
      },
    });
  }

  navigateToFaceAdd(): void {
    this.router.navigate(['/staff/face/add']);
  }
}