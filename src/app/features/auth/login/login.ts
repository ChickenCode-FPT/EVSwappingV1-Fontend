import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

onSubmit() {
  if (this.loginForm.valid) {
    const model = this.loginForm.value;
    this.authService.login(model).subscribe({
      next: (res: any) => {
        console.log('Login successful', res);
        console.log('Login response:', res);
        console.log('requiresTwoFactor:', res.requiresTwoFactor);

        if (res.token.requiresTwoFactor === true || res.token.requiresTwoFactor === 'true') {
          localStorage.setItem('2faEmail', model.email);
          this.router.navigate(['/two-factor'])
        } else  if (res.token && res.token.token){
          localStorage.setItem('token', res.token.token);
          localStorage.setItem('refreshToken', res.token.refreshToken);
          localStorage.setItem('refreshTokenExpiry', res.token.refreshTokenExpiry);

          // Decode JWT
          const payload = JSON.parse(atob(res.token.token.split('.')[1]));
          localStorage.setItem('fullname', payload.fullname);
          localStorage.setItem('roles', payload.roles);

          this.snackBar.open('Login success!', 'Close', { duration: 3000 });
          if (payload.roles && payload.roles.includes('Admin')) {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/home']);
          }
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        this.snackBar.open('Email/Password wrong or Banned', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
      }
    });
  }
}

  loginWithGoogle() {
   window.location.href = 'https://localhost:7292/api/Auth/google-login';
  }
}
