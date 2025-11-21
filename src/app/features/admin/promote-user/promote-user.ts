import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../../shared/sidebar/sidebar';
import { ManageUsersService, PromoteUserRoleDto } from '../../../core/manageusers.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-promote-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent
  ],
  templateUrl: './promote-user.html',
  styleUrls: ['./promute-user.css']
})
export class PromoteUserComponent implements OnInit {
  promoteForm: FormGroup;
  users: any[] = [];
  filteredUsers!: Observable<any[]>;
  selectedUser: any = null;
  loading = false;
  submitting = false;
  showDropdown = false;

  availableRoles = [
    { value: 'User', label: 'User', description: 'Basic user access' },
    { value: 'Staff', label: 'Staff', description: 'Administrative access' },
  ];

  constructor(
    private fb: FormBuilder,
    private userService: ManageUsersService,
    private router: Router
  ) {
    this.promoteForm = this.fb.group({
      userSearch: ['', Validators.required],
      userId: ['', Validators.required],
      newRole: ['', Validators.required],
      replaceExistingRoles: [false]
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.setupUserSearch();
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.showDropdown = false;
      }
    });
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.showNotification('Failed to load users', 'error');
        this.loading = false;
        console.error(err);
      }
    });
  }

  setupUserSearch() {
    this.filteredUsers = this.promoteForm.get('userSearch')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterUsers(value || ''))
    );
  }

  private _filterUsers(value: string): any[] {
    if (typeof value !== 'string') return this.users;
    const filterValue = value.toLowerCase();
    return this.users.filter(user => 
      user.email.toLowerCase().includes(filterValue) ||
      user.fullName.toLowerCase().includes(filterValue)
    );
  }

  displayUser(user: any): string {
    return user ? `${user.fullName} (${user.email})` : '';
  }

  onUserSelected(user: any) {
    this.selectedUser = user;
    this.promoteForm.patchValue({
      userSearch: `${user.fullName} (${user.email})`,
      userId: user.id
    });
    this.showDropdown = false;
  }

  onSubmit() {
    if (this.promoteForm.valid && this.selectedUser) {
      this.submitting = true;
      
      const dto: PromoteUserRoleDto = {
        newRole: this.promoteForm.value.newRole,
        replaceExistingRoles: this.promoteForm.value.replaceExistingRoles
      };

      this.userService.promoteUserRole(this.selectedUser.id, dto).subscribe({
        next: (response) => {
          this.showNotification(
            response.message || 'User promoted successfully!', 
            'success'
          );
          this.submitting = false;
          this.resetForm();
        },
        error: (err) => {
          this.showNotification('Failed to promote user', 'error');
          this.submitting = false;
          console.error(err);
        }
      });
    }
  }

  resetForm() {
    this.promoteForm.reset({
      replaceExistingRoles: false
    });
    this.selectedUser = null;
  }

  goBack() {
    this.router.navigate(['/admin/users/list']);
  }

  // Custom notification function (replaces MatSnackBar)
  private showNotification(message: string, type: 'success' | 'error') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slideIn ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    
    notification.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${type === 'success' 
          ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>'
          : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>'
        }
      </svg>
      <span class="font-medium">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('animate-slideOut');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}