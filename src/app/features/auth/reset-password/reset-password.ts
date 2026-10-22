import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InputComponent } from '../../../shared/components/input/input';
import { AuthService } from '../../../core/services/auth-service';
import { ToastService } from '../../../core/services/toast-service';
import { getConfirmPasswordError, getPasswordError, passwordValidator } from '../../../core/validators/form-validator';
import { finalize } from 'rxjs';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatProgressSpinnerModule,
    InputComponent,
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPasswordComponent implements OnInit {
  readonly email = input<string>('');
  readonly token = input<string>('');

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly validating = signal(true); 
  readonly success = signal(false);
  readonly invalidLink = signal(false);

  readonly form = this.fb.group(
    {
      newPassword: ['', [Validators.required, passwordValidator()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  get passwordError(): string {
    return getPasswordError(this.form.get('newPassword'));
  }
  
  get confirmError(): string {
    return getConfirmPasswordError(this.form.get('confirmPassword'), this.form);
  }

  ngOnInit(): void {
    // No email/token in URL then invalid 
    if (!this.email() || !this.token()) {
      this.invalidLink.set(true);
      this.validating.set(false);
      return;
    }

    this.authService.validateLink({ email: this.email(), token: this.token() })
    .pipe(finalize(() => this.validating.set(false)))
    .subscribe({
      next: (res) => {
        if (!res.isSuccess || !res.data) {
          this.invalidLink.set(true);
        }
      },
      error: () => {
        this.invalidLink.set(true);
      },
    });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);

    this.authService.resetPassword({
      email: this.email(),
      token: this.token(),
      newPassword: this.form.getRawValue().newPassword!,
    })
    .pipe(finalize(() => this.loading.set(false)))
    .subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.success.set(true);
        } else {
          this.toast.error(res.message || 'Reset failed. The link may have expired.');
        }
      },
      error: () => {}
    });
  }
}