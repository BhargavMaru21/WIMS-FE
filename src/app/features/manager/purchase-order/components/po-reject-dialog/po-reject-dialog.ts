import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../../shared/components/input/input';
import { DialogComponent, DialogConfig } from '../../../../../shared/components/dialog/dialog';
import { ToastService } from '../../../../../core/services/toast-service';
import { PurchaseOrderService } from '../../services/po-service';
import { PO_STATUS, PoStatus } from '../../models/po-models';

@Component({
  selector: 'app-po-reject-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, DialogComponent],
  templateUrl: './po-reject-dialog.html',
})
export class PoRejectDialog {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PurchaseOrderService);
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject(MatDialogRef<PoRejectDialog>);
  readonly data: { config: DialogConfig; poId: number; poNumber: string } = inject(MAT_DIALOG_DATA);

  loading = signal(false);

  form = this.fb.group({
    rejectionReason: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
  });

  getError(): string {
    const ctrl = this.form.get('rejectionReason');
    if (!ctrl || !(ctrl.dirty || ctrl.touched)) return '';
    if (ctrl.hasError('required')) return 'Rejection reason is required.';
    if (ctrl.hasError('minlength')) return 'Rejection reason must be at least 5 characters.';
    if (ctrl.hasError('maxlength')) return 'Rejection reason must not exceed 500 characters.';
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const reason = this.form.getRawValue().rejectionReason!;

    let status: PoStatus = PO_STATUS.reject as PoStatus;

    this.service.updatePoStatus(this.data.poId, { status, rejectionReason: reason })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => {
          if (res.isSuccess) {
            this.toast.success(res.data ?? 'Purchase order rejected.');
            this.dialogRef.close(true)
          }
        }
      }); 
  }
}