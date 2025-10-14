import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService, LoginResponseDto } from '../../../core/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-phone',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './updatephone.html',
  styleUrls: ['./updatephone.css']
})
export class UpdatePhoneComponent {
  phoneForm: FormGroup;
  email = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.phoneForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
    });

    const storedEmail = localStorage.getItem('email') || localStorage.getItem('2faEmail');
    if (storedEmail) this.email = storedEmail;
  }

  onSubmit() {
    if (this.phoneForm.invalid) {
      this.phoneForm.markAllAsTouched();
      return;
    }
    if (!this.email) {
      this.snackBar.open('Không tìm thấy email. Vui lòng đăng nhập lại.', 'Đóng', { duration: 3000, panelClass: ['snackbar-error'] });
      return;
    }

    const phoneNumber = this.phoneForm.value.phoneNumber as string;

    this.authService.updatePhone(this.email, phoneNumber).subscribe({
      next: (res: LoginResponseDto) => {
        const t = res.token;

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
        } catch (e) {
          console.warn('Không thể decode JWT payload', e);
        }

        this.snackBar.open('Cập nhật số điện thoại thành công!', 'Đóng', { duration: 3000 });
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error(err);
        const msg = err?.error?.detail || err?.error?.title || 'Cập nhật thất bại';
        this.snackBar.open(msg, 'Đóng', { duration: 3000, panelClass: ['snackbar-error'] });
      }
    });
  }
}
