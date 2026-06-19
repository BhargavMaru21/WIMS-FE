import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { InputComponent } from '../../../../../shared/components/input/input';
import { DialogComponent, DialogConfig } from '../../../../../shared/components/dialog/dialog';
import { ToastService } from '../../../../../core/services/toast-service';
import { WarehouseManagementService } from '../../../warehouse-management/services/warehouse-service';
import { BinResponse, EditBinDialogData, WarehouseDropdown, ZoneDropdown } from '../../../warehouse-management/models/warehouse-models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-bin-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, InputComponent, DialogComponent],
  templateUrl: './bin-form-dialog.html',
})
export class BinFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(WarehouseManagementService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  readonly dialogRef = inject(MatDialogRef<BinFormDialog>);
  readonly data: EditBinDialogData = inject(MAT_DIALOG_DATA);

   loading = signal(false);
   isEdit = signal(false);
   filteredZones = signal<ZoneDropdown[]>([]);
   isZoneExists = signal(true)

  form = this.fb.group({
    warehouseId: [null as number | null, Validators.required],
    zoneId: [null as number | null, Validators.required],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100),Validators.pattern(/^(?=.*[A-Za-z])[A-Za-z0-9\s\-_]+$/)]],
    maxCapacity: [0, [Validators.required, Validators.min(0)]],
  });

  getNameError() {
    var ctrl = this.form.get('name')
    if (!ctrl || !(ctrl.dirty || ctrl.touched)) return "";
    if (ctrl.hasError("required")) return `Bin name is Required`
    if (ctrl.hasError("minlength")) return `Bin name must be at least 2 characters long.`
    if (ctrl.hasError("maxlength")) return `Bin name must not exceed 100 characters.`
    if (ctrl.hasError("pattern")) return "Bin name allows letters, numbers, spaces, hyphens, and underscores (must include a letter)."
    return ""
  }


  ngOnInit(): void {
    if (this.data.bin) {
      this.isEdit.set(true);
      const b = this.data.bin;

      this.filteredZones.set(this.data.zones.filter(z => z.warehouseId === b.warehouseId));

      this.form.patchValue({
        warehouseId: b.warehouseId,
        zoneId: b.zoneId,
        name: b.name,
        maxCapacity: b.maxCapacity,
      });

      this.form.get('warehouseId')?.disable();
      this.form.get('zoneId')?.disable();
    } else {
      this.form.get('zoneId')?.disable()
      this.form.get('warehouseId')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(warehouseId => {
          if (warehouseId) this.form.get('zoneId')?.enable()
          else this.form.get('zoneId')?.disable()
        })
    }
  }

  get warehouses(): WarehouseDropdown[] {
    return this.data.warehouses ?? [];
  }

  onWarehouseChange(warehouseId: number | null): void {
    this.isZoneExists.set(true)
    this.form.get('zoneId')?.setValue(null);
    if (warehouseId) {
      let zones = this.data.zones.filter(z => z.warehouseId === warehouseId);
      if(zones.length > 0) this.filteredZones.set(zones);
      else {
        this.isZoneExists.set(false)
        this.form.get('zoneId')?.disable()
      }
    } else {
      this.filteredZones.set(this.data.zones);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.isZoneExists()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const raw = this.form.getRawValue();

    const request$ = this.isEdit()
      ? this.service.updateBin(this.data.bin!.id, { name: raw.name!, maxCapacity: raw.maxCapacity! })
      : this.service.createBin({ zoneId: raw.zoneId!, name: raw.name!, maxCapacity: raw.maxCapacity! });

    request$.pipe(finalize(()=>this.loading.set(false))).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.toast.success(this.isEdit() ? 'Bin updated.' : 'Bin created.');
          this.dialogRef.close(true);
        } else {
          this.toast.error(res.message ?? 'Something went wrong.');
        }
      }
    });
  }
}