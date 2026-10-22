import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';

import { InputComponent } from '../../../shared/components/input/input';
import { AuthService } from '../../../core/services/auth-service';
import { emailValidator, getEmailError, getPasswordError, passwordValidator } from '../../../core/validators/form-validator';
import { ToastService } from '../../../core/services/toast-service';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
    InputComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, emailValidator()]],
    password: ['', [Validators.required, passwordValidator()]],
  });

  get emailError(): string { return getEmailError(this.form.get('email')); }
  get passwordError(): string { return getPasswordError(this.form.get('password')); }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);

    const { email, password } = this.form.getRawValue();

    this.authService
      .login({ email: email!.trim(), password: password!.trim() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.router.navigateByUrl(this.authService.getDashboardRoute());
            this.toast.success('Login successful!');
          }
        },
        error: () => {}
      });
  }
}