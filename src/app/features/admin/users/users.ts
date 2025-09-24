import { Component, OnInit, ViewChild } from '@angular/core';
import { ManageUsersService, UserDto } from '../../../core/manageusers.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SidebarComponent } from '../../../shared/sidebar/sidenar';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    SidebarComponent
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class UsersComponent implements OnInit {
  users: UserDto[] = [];
  loading = true;
  error = '';
  displayedColumns: string[] = ['email', 'fullName', 'phoneNumber', 'roles','lockout'];
  dataSource!: MatTableDataSource<UserDto>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private userService: ManageUsersService) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.dataSource = new MatTableDataSource(this.users);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users';
        console.error(err);
        this.loading = false;
      }
    });
    
    
  }
  lockUser(id: string) {
    this.userService.lockUser(id).subscribe({
      next: () => this.refreshUsers(),
      error: (err) => console.error(err)
    });
  }

  unlockUser(id: string) {
    this.userService.unlockUser(id).subscribe({
      next: () => this.refreshUsers(),
      error: (err) => console.error(err)
    });
  }
  private refreshUsers() {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.dataSource.data = this.users;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to reload users';
        console.error(err);
        this.loading = false;
      }
    });
  }
}
