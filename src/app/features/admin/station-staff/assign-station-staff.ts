  import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
  import { Router } from '@angular/router';
  import { SidebarComponent } from '../../../shared/sidebar/sidebar';
  import { StationStaffService, AssignStaffDto, StationDto } from '../../../core/station-staff.service';
  import { ManageUsersService, UserDto } from '../../../core/manageusers.service';

  // PrimeNG Imports
  import { CardModule } from 'primeng/card';
  import { ButtonModule } from 'primeng/button';
  import { AutoCompleteModule } from 'primeng/autocomplete';
  import { InputTextModule } from 'primeng/inputtext';
  import { MessageModule } from 'primeng/message';
  import { ToastModule } from 'primeng/toast';
  import { MessageService } from 'primeng/api';
  import { ProgressSpinnerModule } from 'primeng/progressspinner';
  import { TagModule } from 'primeng/tag';
  import { DividerModule } from 'primeng/divider';
  import { Select } from "primeng/select";

  type TagSeverity = "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | null | undefined;

  @Component({
    selector: 'app-assign-station-staff',
    standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      SidebarComponent,
      CardModule,
      ButtonModule,
      AutoCompleteModule,
      InputTextModule,
      MessageModule,
      ToastModule,
      ProgressSpinnerModule,
      TagModule,
      DividerModule,
      Select,
      FormsModule
  ],
    providers: [MessageService],
    templateUrl: './assign-station-staff.html',
    styleUrls: ['./assign-station-staff.css']
  })
  export class AssignStationStaffComponent implements OnInit {
    assignForm: FormGroup;
    stations: StationDto[] = [];
    users: UserDto[] = [];
    filteredUsers: UserDto[] = [];
    selectedStation: StationDto | null = null;
    selectedUser: UserDto | null = null;
    loading = false;
    submitting = false;

    staffRoles = [
      { label: 'Station Manager', value: 'Manager' },
      { label: 'Technician', value: 'Technician' },
      { label: 'Operator', value: 'Operator' },
      { label: 'Support Staff', value: 'Support' }
    ];

    constructor(
      private fb: FormBuilder,
      private stationStaffService: StationStaffService,
      private userService: ManageUsersService,
      private messageService: MessageService,
      private router: Router
    ) {
      this.assignForm = this.fb.group({
        stationId: [null, Validators.required],
        userId: [null, Validators.required],
        role: [null, Validators.required]
      });
    }

    ngOnInit() {
      this.loadStations();
      this.loadUsers();
    }

    loadStations() {
      this.loading = true;
      this.stationStaffService.getAllStations().subscribe({
        next: (data) => {
          this.stations = data;
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load stations'
          });
          this.loading = false;
        }
      });
    }

    loadUsers() {
      this.userService.getAllUsers().subscribe({
        next: (data) => {
          this.users = data;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load users'
          });
        }
      });
    }

    filterUsers(event: any) {
      const query = event.query.toLowerCase();
      this.filteredUsers = this.users.filter(user =>
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    onStationChange(event: any) {
      this.selectedStation = this.stations.find(s => s.stationId === event.value) || null;
    }

   onUserSelect(event: any) {
  console.log('Selected user:', event);
  this.selectedUser = event.value;
  this.assignForm.patchValue({ userId: event.value.id});
  console.log('Form value:', this.assignForm.value);
  console.log('Form valid:', this.assignForm.valid);
  console.log('Selected user after patch:', event.id);
}


    onSubmit() {
      if (this.assignForm.valid) {
        this.submitting = true;
        const dto: AssignStaffDto = {
          userId: this.assignForm.value.userId,
          role: this.assignForm.value.role
        };

        this.stationStaffService.assignStaff(this.assignForm.value.stationId, dto).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Staff assigned successfully'
            });
            this.submitting = false;
            this.resetForm();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Failed to assign staff'
            });
            this.submitting = false;
          }
        });
      }
    }

    resetForm() {
      this.assignForm.reset();
      this.selectedStation = null;
      this.selectedUser = null;
    }

    goBack() {
      this.router.navigate(['/admin/stations']);
    }

    getStatusSeverity(status: number): TagSeverity {
      const severityMap: { [key: number]: TagSeverity } = {
        0: 'secondary',  
        1: 'success',    
        2: 'warn',      
        3: 'danger'      
      };
      return severityMap[status] || 'secondary';
    }

    getStatusLabel(status: number): string {
      const labelMap: { [key: number]: string } = {
        0: 'Inactive',
        1: 'Active',
        2: 'Maintenance',
        3: 'Closed'
      };
      return labelMap[status] || 'Unknown';
    }
  }