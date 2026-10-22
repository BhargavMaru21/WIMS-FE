import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InputComponent } from '../../../../../shared/components/input/input';
import { DialogComponent, DialogConfig } from '../../../../../shared/components/dialog/dialog';
import { ToastService } from '../../../../../core/services/toast-service';
import { WarehouseManagementService } from '../../services/warehouse-service';
import { WarehouseCreateRequest, WarehouseResponse, WarehouseUpdateRequest } from '../../models/warehouse-models';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-warehouse-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, DialogComponent],
  templateUrl: './warehouse-form-dialog.html',
})
export class WarehouseFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(WarehouseManagementService);
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject(MatDialogRef<WarehouseFormDialogComponent>);
  readonly data: { config: DialogConfig; warehouse?: WarehouseResponse } = inject(MAT_DIALOG_DATA);

  loading = signal(false);
  isEdit = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^(?=.*[A-Za-z])[A-Za-z0-9\s\-_]+$/)]],
    address: ['', [Validators.required, Validators.maxLength(200)]],
    city: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z\s]+$/)]],
    contactPerson: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150), Validators.pattern(/^[a-zA-Z\s]+$/)]],
    contactPhone: ['', [Validators.required, Validators.pattern(/^(?:\+91[\-\s]?)?[6-9]\d{9}$/)]],
  });

  private patternErros: Record<string, string> = {
    "name": "Warehouse name allows letters, numbers, spaces, hyphens, and underscores (must include a letter).",
    "city": "City name can only contain letters and spaces.",
    "contactPerson": "Contact person name can only contain letters and spaces.",
    "contactPhone": "Contact phone number must be a valid Indian phone number."
  }

  public getError(field: string) {
    var ctrl = this.form.get(field);
    if (!ctrl || !(ctrl.dirty || ctrl.touched)) return "";
    if (ctrl.hasError("required")) return `${field} is Required`
    if (ctrl.hasError("minlength")) return `${field} name must be at least 2 characters long.`
    if (ctrl.hasError("maxlength")) return `${field} name must not exceed 100 characters.`
    if (ctrl.hasError("pattern")) return `${this.patternErros[field] || "Invalid format."}`
    return ""
  }

  ngOnInit(): void {
    if (this.data.warehouse) {
      this.isEdit.set(true);
      const w = this.data.warehouse;
      this.form.patchValue({
        name: w.name,
        address: w.address,
        city: w.city,
        contactPerson: w.contactPerson,
        contactPhone: w.contactPhone,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const rawValue = this.form.getRawValue()

    const payload: WarehouseCreateRequest = {
      name: rawValue.name!,
      address: rawValue.address!,
      city: rawValue.city!,
      contactPerson: rawValue.contactPerson!,
      contactPhone: rawValue.contactPhone!
    }

    const request$ = this.isEdit()
      ? this.svc.updateWarehouse(this.data.warehouse!.id, payload)
      : this.svc.createWarehouse(payload);

    request$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.toast.success(this.isEdit() ? 'Warehouse updated.' : 'Warehouse created.');
          this.dialogRef.close(true);
        }
      },
      error: () => { },
    });
  }
}