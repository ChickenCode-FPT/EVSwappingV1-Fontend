import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  token: string | null = null;
  email: string | null = null;
  submitted = false;
  message = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || null;
      this.email = params['email'] || null;
    });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    this.submitted = true;
    if (this.resetForm.invalid || !this.token || !this.email) return;

    const password = this.resetForm.value.password;

    this.authService.resetPassword(this.email, this.token, password).subscribe({
      next: () => {
        this.message = 'Đổi mật khẩu thành công!';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: () => {
        this.message = 'Có lỗi xảy ra. Vui lòng thử lại.';
      }
    });
  }
}
