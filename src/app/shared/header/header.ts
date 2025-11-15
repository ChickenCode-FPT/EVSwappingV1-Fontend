import { Component } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']   
})
export class Header {
  constructor(public authService: AuthService, private router: Router) {}

  isCustomer(): boolean {
    return this.authService.hasRole('Customer');
  }

  isAdmin(): boolean {
    return this.authService.hasRole('Admin');
  }

  isStaff(): boolean {
    return this.authService.hasRole('Staff');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
