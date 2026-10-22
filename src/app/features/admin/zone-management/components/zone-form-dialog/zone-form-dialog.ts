import { Component, inject, OnInit, signal } from '@angular/core';
import { DialogComponent } from "../../../../../shared/components/dialog/dialog";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from "../../../../../shared/components/input/input";
import { WarehouseManagementService } from '../../../warehouse-management/services/warehouse-service';
import { ToastService } from '../../../../../core/services/toast-service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from '@angular/material/select';
import { EditZoneDialogData, WarehouseDropdown, ZoneCreateRequest, ZoneUpdateRequest } from '../../../warehouse-management/models/warehouse-models';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-zone-create-dialog',
  imports: [DialogComponent, ReactiveFormsModule, InputComponent, MatFormFieldModule, MatSelectModule],
  templateUrl: './zone-form-dialog.html',
  styleUrl: './zone-form-dialog.scss',
})
export class ZoneCreateDialog implements OnInit {
  private readonly fb = inject(FormBuilder)
  private readonly service = inject(WarehouseManagementService)
  private readonly toast = inject(ToastService)
  private readonly dialogRef = inject(MatDialogRef<ZoneCreateDialog>);
  readonly data: EditZoneDialogData = inject(MAT_DIALOG_DATA);

  loading = signal(false)
  isEdit = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^(?=.*[A-Za-z])[A-Za-z0-9\s\-_]+$/)]],
    warehouseId: [null as number | null, Validators.required]
  })

  getNameError() {
    var ctrl = this.form.get('name')
    if (!ctrl || !(ctrl.dirty || ctrl.touched)) return "";
    if (ctrl.hasError("required")) return `zone name is Required`
    if (ctrl.hasError("minlength")) return `zone name must be at least 2 characters long.`
    if (ctrl.hasError("maxlength")) return `zone name must not exceed 100 characters.`
    if (ctrl.hasError("pattern")) return "Zone name allows letters, numbers, spaces, hyphens, and underscores (must include a letter)."
    return ""
  }

  ngOnInit(): void {
    if (this.data.zone) {
      this.isEdit.set(true)
      const z = this.data.zone;

      this.form.patchValue({
        name: z.name,
        warehouseId: z.warehouseId
      })

      this.form.get('warehouseId')?.disable()
    }
  }

  get warehouseOptions(): WarehouseDropdown[] {
    return this.data.warehouseOptions ?? [];
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const rawValue = this.form.getRawValue()

    const createPayload: ZoneCreateRequest = {
      warehouseId: rawValue.warehouseId!,
      name: rawValue.name!
    }

    const updatePayload: ZoneUpdateRequest = {
      name: rawValue.name!
    }

    const request$ = this.isEdit() ? this.service.updateZone(this.data.zone.id, updatePayload) : this.service.createZone(createPayload)

    request$.pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => {
          if (res.isSuccess) {
            this.toast.success(this.isEdit() ? 'Zone updated.' : 'Zone created.');
            this.dialogRef.close(true);
          } else {
            this.toast.error(res.message ?? 'Something went wrong.');
          }
        }
      })

  }
}
