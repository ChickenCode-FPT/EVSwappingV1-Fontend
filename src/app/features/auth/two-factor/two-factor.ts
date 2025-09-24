import { Component } from '@angular/core';
import { AuthService } from '../../../core/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-two-factor',
  standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './two-factor.html',
  styleUrls: ['./two-factor.css']
})
export class TwoFactorComponent {
  email = 'tranduy256789@gmail.com'; 
  tokenForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router) {
    this.tokenForm = this.fb.group({
      token: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  onSubmit() {
    if (this.tokenForm.invalid) return;

    const token = this.tokenForm.value.token;

    this.authService.verifyTwoFactor(this.email, token).subscribe({
      next: (res: any) => {
        this.successMessage = 'Đăng nhập thành công!';
        this.errorMessage = '';

        localStorage.setItem('token', res.token);
        localStorage.setItem('refreshToken', res.refreshToken);
        localStorage.setItem('refreshTokenExpiry', res.refreshTokenExpiry);
        const payload = JSON.parse(atob(res.token.split('.')[1]));
        localStorage.setItem('fullname', payload.fullname);
        localStorage.setItem('roles', payload.roles);
         this.router.navigate(['/home'])

      },
      error: (err) => {
        this.errorMessage = err.error || 'Mã 2FA không hợp lệ';
      }
    });
  }
}
