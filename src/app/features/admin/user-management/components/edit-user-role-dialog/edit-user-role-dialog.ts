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
import {
  ROLES_REQUIRING_WAREHOUSE,
  ROLES_WITHOUT_WAREHOUSE,
  USER_ROLES,
  UserSummaryResponse,
} from '../../models/user-models';

@Component({
  selector: 'app-edit-user-role-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, DialogComponent],
  templateUrl: './edit-user-role-dialog.html',
})
export class EditUserRoleDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UserManagementService);
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject(MatDialogRef<EditUserRoleDialog>);
  readonly data: { config: DialogConfig; user: UserSummaryResponse; warehouses: WarehouseDropdown[] } = inject(MAT_DIALOG_DATA);

  loading = signal(false);
  readonly rolesRequiringWarehouse = ROLES_REQUIRING_WAREHOUSE;
  readonly rolesWithoutWarehouse = ROLES_WITHOUT_WAREHOUSE;

  get roleOptions(): string[] {
    return USER_ROLES.filter((r) => r !== this.data.user.role);
  }
  get warehouses(): WarehouseDropdown[] {
    return this.data.warehouses ?? [];
  }

  form = this.fb.group({
    role: ['', Validators.required],
    warehouseId: [null as number | null],
  });

  ngOnInit(): void {
    this.form.get('warehouseId')?.disable();

    this.form.get('role')?.valueChanges.subscribe((role) => {
      const warehouseControl = this.form.get('warehouseId');
      const currentUserIsWarehouseRole = this.rolesRequiringWarehouse.includes(this.data.user.role);
      const newRoleRequiresWarehouse = role ? this.rolesRequiringWarehouse.includes(role) : false;
      const newRoleIsNonWarehouse = role ? this.rolesWithoutWarehouse.includes(role) : false;

      if (newRoleRequiresWarehouse && !currentUserIsWarehouseRole) {
        warehouseControl?.enable();
        warehouseControl?.setValidators(Validators.required);
        warehouseControl?.setValue(null);
      } else if (
        newRoleIsNonWarehouse ||
        (newRoleRequiresWarehouse && currentUserIsWarehouseRole)
      ) {
        warehouseControl?.disable();
        warehouseControl?.clearValidators();
        warehouseControl?.setValue(null);
      }
      warehouseControl?.updateValueAndValidity();
    });
  }

  get selectedRole(): string {
    return this.form.get('role')?.value ?? '';
  }

  get showWarehouseField(): boolean {
    const currentIsNonWarehouse = this.rolesWithoutWarehouse.includes(this.data.user.role);
    const newRequiresWarehouse = this.rolesRequiringWarehouse.includes(this.selectedRole);
    return currentIsNonWarehouse && newRequiresWarehouse;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const raw = this.form.getRawValue();

    this.service.updateUserRole(this.data.user.id, {
        role: raw.role!,
        warehouseId: raw.warehouseId ?? null,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toast.success('User role updated successfully.');
            this.dialogRef.close(true);
          } else {
            this.toast.error(res.message ?? 'Failed to update role.');
          }
        }
      });
  }
}
