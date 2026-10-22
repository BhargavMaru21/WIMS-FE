import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import { DialogComponent } from '../../../../shared/components/dialog/dialog';
import { InputComponent } from '../../../../shared/components/input/input';

import { DialogConfig } from '../../../../shared/components/dialog/dialog';
import { AuthService } from '../../../../core/services/auth-service';
import { ToastService } from '../../../../core/services/toast-service';
import { getConfirmPasswordError, getPasswordError, passwordValidator } from '../../../../core/validators/form-validator';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const np = control.get('newPassword')?.value;
  const cp = control.get('confirmPassword')?.value;
  return np && cp && np !== cp ? { passwordMismatch: true } : null;
}

export interface ChangePasswordDialogData {
  config: DialogConfig;
}

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogComponent, InputComponent],
  templateUrl: './change-password-dialog.html',
})
export class ChangePasswordDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject(MatDialogRef<ChangePasswordDialogComponent>);

   loading = signal(false);

   form = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, passwordValidator()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  get isInvalid(): boolean {
    return this.form.invalid;
  }

  get currentPasswordError(): string {
    const ctrl = this.form.get('currentPassword');
    if (!ctrl?.touched) return '';
    if (ctrl.errors?.['required']) return 'Current password is required';
    return '';
  }

  get newPasswordError(): string {
    return getPasswordError(this.form.get('newPassword'));
  }

  get confirmError(): string {
    return getConfirmPasswordError(this.form.get('confirmPassword'), this.form);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    const { currentPassword, newPassword } = this.form.getRawValue();

    this.loading.set(true);
    this.authService
      .changePassword({
        currentPassword: currentPassword!,
        newPassword: newPassword!,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toast.success('Password changed successfully.');
            this.dialogRef.close(true);
          }
        },
      });
  }
}