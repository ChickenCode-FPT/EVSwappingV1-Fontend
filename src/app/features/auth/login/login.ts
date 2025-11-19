// src\app\features\auth\login\login.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, LoginResponseDto } from '../../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const model = this.loginForm.value;

    this.auth.login(model).subscribe({
      next: (res: LoginResponseDto) => {
        const t = res.token;

        if (t.requiresTwoFactor === true) {
          localStorage.setItem('2faEmail', model.email);
          this.router.navigate(['/two-factor']);
          return;
        }

        if (!t?.token) {
          this.snackBar.open('Token is missing in response', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
          return;
        }

        localStorage.setItem('token', t.token);
        localStorage.setItem('refreshToken', t.refreshToken);
        localStorage.setItem('refreshTokenExpiry', t.refreshTokenExpiry);

        try {
          const payload = JSON.parse(atob(t.token.split('.')[1]));
          if (payload?.fullname) localStorage.setItem('fullname', payload.fullname);

          const roles = Array.isArray(payload?.roles)
            ? payload.roles.join(',')
            : (payload?.roles ?? '');
          if (roles) localStorage.setItem('roles', roles);

          this.snackBar.open('Login success!', 'Close', { duration: 3000 });

          if (roles.includes('Admin')) {
            this.router.navigate(['/admin/dashboard']);
          } else if (roles.includes('Staff')) {
            this.router.navigate(['/staff']);
          } else {
            this.router.navigate(['/home']);
          }
        } catch (e) {
          console.warn('Cannot decode JWT payload', e);
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        this.snackBar.open('Email/Password wrong or Banned', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  loginWithGoogle() {
    window.location.href = 'https://localhost:7292/api/Auth/google-login';
  }
}
