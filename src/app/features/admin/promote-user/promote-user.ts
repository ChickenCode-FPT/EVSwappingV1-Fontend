import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SidebarComponent } from '../../../shared/sidebar/sidebar';
import { ManageUsersService,PromoteUserRoleDto } from '../../../core/manageusers.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-promote-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule
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

  availableRoles = [
    { value: 'User', label: 'User', description: 'Basic user access' },
    { value: 'Staff', label: 'Staff', description: 'Administrative access' },
  ];

  constructor(
    private fb: FormBuilder,
    private userService: ManageUsersService,
    private snackBar: MatSnackBar,
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
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
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
      userId: user.id
    });
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
          this.snackBar.open(
            response.message || 'User promoted successfully!', 
            'Close', 
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          this.submitting = false;
          this.resetForm();
        },
        error: (err) => {
          this.snackBar.open(
            'Failed to promote user', 
            'Close', 
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
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
}