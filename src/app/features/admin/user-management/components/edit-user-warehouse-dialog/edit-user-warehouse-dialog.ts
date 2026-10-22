import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { DialogComponent, DialogConfig } from '../../../../../shared/components/dialog/dialog';
import { ToastService } from '../../../../../core/services/toast-service';
import { UserManagementService } from '../../services/user-management-service';
import { WarehouseDropdown } from '../../../warehouse-management/models/warehouse-models';
import { UserSummaryResponse } from '../../models/user-models';

@Component({
  selector: 'app-edit-user-warehouse-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, DialogComponent],
  templateUrl: './edit-user-warehouse-dialog.html',
})
export class EditUserWarehouseDialog {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UserManagementService);
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject(MatDialogRef<EditUserWarehouseDialog>);
  readonly data: { config: DialogConfig; user: UserSummaryResponse; warehouses: WarehouseDropdown[] } = inject(MAT_DIALOG_DATA);

  loading = signal(false);

  form = this.fb.group({
    warehouseId: [null as number | null, Validators.required],
  });

  get availableWarehouses(): WarehouseDropdown[] {
    return (this.data.warehouses ?? []).filter((w) => w.name !== this.data.user.warehouseName);
  }

  get currentWarehouseName(): string {
    return this.data.warehouses?.find((w) => w.name === this.data.user.warehouseName)?.name ?? '—';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const raw = this.form.getRawValue();

    this.service.updateUserWarehouse(this.data.user.id, {
        warehouseId: raw.warehouseId!,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toast.success('Warehouse assignment updated successfully.');
            this.dialogRef.close(true);
          } else {
            this.toast.error(res.message ?? 'Failed to update warehouse.');
          }
        }
      });
  }
}
