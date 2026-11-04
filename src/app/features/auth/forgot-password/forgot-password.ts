import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InputComponent } from '../../../shared/components/input/input';
import { AuthService } from '../../../core/services/auth-service';
import { ToastService } from '../../../core/services/toast-service';
import { emailValidator, getEmailError } from '../../../core/validators/form-validator';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatProgressSpinnerModule,
    InputComponent,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly submittedEmail = signal('');
  // NOTE: Set to false to restore forgot-password once SMTP credentials are fixed
  readonly isServiceUnavailable = signal(true);

  readonly form = this.fb.group({
    // NOTE: Change back to: email: ['', [Validators.required, emailValidator()]], once email service is restored
    email: [{ value: '', disabled: true }, [Validators.required, emailValidator()]],
  });

  get emailError(): string { return getEmailError(this.form.get('email')); }

  onSubmit(): void {
    if (this.isServiceUnavailable()) {
      this.toast.error('Password reset is currently unavailable due to an email service issue. Please contact your administrator.');
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    const email = this.form.getRawValue().email!;

    this.authService.forgotPassword({ email }).pipe(finalize(()=> this.loading.set(false))).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.submittedEmail.set(email);
          this.submitted.set(true);
        } else {
          this.toast.error(res.message || 'Something went wrong. Please try again.');
        }
      },
      error: () => {}
    });
  }

  tryAgain(): void {
    this.submitted.set(false);
    this.submittedEmail.set('');
    this.form.reset();
  }
}
