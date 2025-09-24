import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-disable-2fa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <h2>Tắt xác thực 2 lớp (2FA)</h2>
      <p>Bấm nút bên dưới để tắt 2FA cho tài khoản của bạn.</p>
      <button (click)="disable2FA()" class="btn-disable">Tắt 2FA</button>
      <p *ngIf="message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .auth-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 2rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      text-align: center;
      background-color: #f9f9f9;
    }
    .btn-disable {
      padding: 0.5rem 1.5rem;
      font-size: 1rem;
      background-color: #e74c3c;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 1rem;
    }
    .btn-disable:hover {
      background-color: #c0392b;
    }
  `]
})
export class Disable2FAComponent {
  message = '';

  constructor(private authService: AuthService, private snackBar: MatSnackBar, private router: Router) {}

  disable2FA() {
   const token = localStorage.getItem('token');
if (!token) {
  this.snackBar.open('Không tìm thấy token', 'Close', { duration: 3000 });
  return;
}

const payload = JSON.parse(atob(token.split('.')[1]));
const email = payload.email;  
if (!email) {
  this.snackBar.open('Không tìm thấy email trong token', 'Close', { duration: 3000 });
  return;
}
    this.authService.disable2FA({ email }).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.snackBar.open(res.message, 'Close', { duration: 3000 });
         this.router.navigate(['/two-factor'])
        
      },
      error: (err) => {
        this.snackBar.open('Không thể tắt 2FA', 'Close', { duration: 3000 });
      }
    });
  }
}
