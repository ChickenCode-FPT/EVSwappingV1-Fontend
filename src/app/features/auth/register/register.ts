import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, RegisterUserCommand } from '../../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{9,11}$')]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const model: RegisterUserCommand = this.registerForm.value;
      this.authService.register(model).subscribe({
        next: (res) => {
          console.log('Register success, token:', res);
          alert('Register success!');
        },
        error: (err) => {
          console.error('Register failed', err);
          alert('Register failed!');
        }
      });
    }
  }
}
