import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import { DialogComponent } from '../../../../shared/components/dialog/dialog';
import { InputComponent } from '../../../../shared/components/input/input';
import { DialogConfig } from '../../../../shared/components/dialog/dialog';
import { UserProfileResponse } from '../../../../core/models/auth-models';
import { ToastService } from '../../../../core/services/toast-service';
import { AuthService } from '../../../../core/services/auth-service';

export interface EditProfileDialogData {
  config: DialogConfig;
  profile: UserProfileResponse;
}

@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogComponent, InputComponent],
  templateUrl: './edit-profile-dialog.html',
})
export class EditProfileDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<EditProfileDialogComponent>);
  readonly data: EditProfileDialogData = inject(MAT_DIALOG_DATA);

  readonly loading = signal(false);

  readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2),Validators.pattern(/^[a-zA-Z\s]+$/)]],
    phoneNumber: [''],
  });

  get isInvalid(): boolean {
    return this.form.invalid;
  }

  ngOnInit(): void {
    const p = this.data.profile;
    this.form.patchValue({
      fullName: p.fullName,
      phoneNumber: p.phoneNumber ?? '',
    });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    const { fullName, phoneNumber } = this.form.getRawValue();

    this.loading.set(true);
    this.authService
      .updateProfile({
        fullName: fullName!.trim(),
        phoneNumber: phoneNumber?.trim() || null,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toast.success('Profile updated successfully.');
            this.dialogRef.close(res.data);
          }
        },
      });
  }
}