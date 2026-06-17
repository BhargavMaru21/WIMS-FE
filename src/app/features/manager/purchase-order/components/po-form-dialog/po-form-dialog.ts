import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { finalize } from 'rxjs';
import { PurchaseOrderService } from '../../services/po-service';
import { PoResponse } from '../../models/po-models';
import { InputComponent } from '../../../../../shared/components/input/input';
import { DialogComponent, DialogConfig } from '../../../../../shared/components/dialog/dialog';
import { ToastService } from '../../../../../core/services/toast-service';

@Component({
  selector: 'app-po-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    InputComponent,
    DialogComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './po-form-dialog.html',
})
export class PoFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PurchaseOrderService);
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject(MatDialogRef<PoFormDialog>);
  readonly data: { config: DialogConfig; po?: PoResponse } = inject(MAT_DIALOG_DATA);

  loading = signal(false);
  isEdit = signal(false);

  minDate = new Date(Date.now() + 86400000); // tomorrow
  maxDate = new Date(2026, 11, 31); 

  form = this.fb.group({
    supplierName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200), Validators.pattern(/^[a-zA-Z\s]+$/)]],
    supplierContact: ['', [Validators.pattern(/^(?:\+91[\-\s]?)?[6-9]\d{9}$/)]],
    expectedDelivery: [null as Date | null, Validators.required],
    notes: ['', [Validators.maxLength(1000)]],
  });

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl || !(ctrl.dirty || ctrl.touched)) return '';

    if (ctrl.hasError('required')) return `${field} is required.`;
    if (ctrl.hasError('minlength')) return `${field} must be at least 2 characters.`;
    if (ctrl.hasError('pattern')) return field === 'supplierName' ? 'Supplier Name can only contain letters and spaces.' : 'Supplier contact must be a valid Indian phone number.'
    if (ctrl.hasError('maxlength')) return field === 'supplierName' ? 'Supplier name must not exceed 200 characters.' : 'Notes must not exceed 1000 characters.';
    return '';
  }

  ngOnInit(): void {
    if (this.data.po) {
      this.isEdit.set(true);
      const po = this.data.po;
      this.form.patchValue({
        supplierName: po.supplierName,
        supplierContact: po.supplierContact ?? '',
        expectedDelivery: new Date(po.expectedDelivery),
        notes: po.notes ?? '',
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const raw = this.form.getRawValue();
    
    const expectedDelivery = this.toDateOnlyString(raw.expectedDelivery!);

    const request$ = this.isEdit()
      ? this.service.updatePo(this.data.po!.id, {
        supplierName: raw.supplierName!,
        supplierContact: raw.supplierContact || undefined,
        expectedDelivery,
        notes: raw.notes || undefined,
      })
      : this.service.createPo({
        supplierName: raw.supplierName!,
        supplierContact: raw.supplierContact || undefined,
        expectedDelivery,
        notes: raw.notes || undefined,
      });

    request$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.toast.success(this.isEdit() ? 'Purchase order updated.' : 'Purchase order created.');
          this.dialogRef.close(true);
        }
      }
    });
  }

  private toDateOnlyString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}