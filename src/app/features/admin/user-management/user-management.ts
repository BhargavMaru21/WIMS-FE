import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputComponent } from '../../../shared/components/input/input';
import { ToastService } from '../../../core/services/toast-service';
import { WarehouseManagementService } from '../warehouse-management/services/warehouse-service';
import { WarehouseDropdown } from '../warehouse-management/models/warehouse-models';
import { UserManagementService } from './services/user-management-service';
import { ALL_USER_ROLES, USER_STATUSES, UserSummaryResponse } from './models/user-models';
import { CreateUserDialog } from './components/create-user-dialog/create-user-dialog';
import { EditUserRoleDialog } from './components/edit-user-role-dialog/edit-user-role-dialog';
import { EditUserWarehouseDialog } from './components/edit-user-warehouse-dialog/edit-user-warehouse-dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DialogService } from '../../../core/services/dialog-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    InputComponent,
  ],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagement implements OnInit {
  private readonly service = inject(UserManagementService);
  private readonly warehouseService = inject(WarehouseManagementService);
  private readonly toast = inject(ToastService);
  private readonly dialogService = inject(DialogService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  displayedColumns = ['fullName', 'email', 'role', 'warehouseName', 'status', 'actions'];
  dataSource = new MatTableDataSource<UserSummaryResponse>();

  loading = signal(false);
  totalCount = signal(0);

  search = new FormControl('', [Validators.maxLength(100)]);
  statusFilter = signal('');
  roleFilter = signal('');
  selectedRoleIds = signal<string[]>([]);

  pageSize = signal(5);
  pageIndex = signal(0);
  sortBy = signal('createdAt');
  sortDirection = signal('desc');

  readonly roleOptions = ALL_USER_ROLES;
  readonly statusOptions = USER_STATUSES;
  warehouses = signal<WarehouseDropdown[]>([]);

  ngOnInit(): void {
    this.search.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.pageIndex.set(0);
      this.loadData();
    });

    this.loadWarehouses();
    this.loadData();
  }

  searchError(): string {
    if (!this.search || !(this.search.dirty || this.search.touched)) return '';
    if (this.search.hasError('maxlength')) return 'Search value must not exceed 100 characters.';
    return '';
  }

  loadData(): void {
    this.loading.set(true);

    const filters: Record<string, string> = {};
    if (this.statusFilter()) filters['Status'] = this.statusFilter();
    if (this.roleFilter()) filters['Role'] = this.roleFilter();

    this.service.getUsers(
      {
        pageNumber: this.pageIndex() + 1,
        pageSize: this.pageSize(),
        search: this.search.value ?? '',
        sortBy: this.sortBy(),
        sortDirection: this.sortDirection(),
      },
      filters
    ).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: res => {
        if (res.isSuccess && res.data) {
          this.dataSource.data = res.data.items;
          this.totalCount.set(res.data.totalCount);
        }
      }
    });
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses(
      { pageNumber: 1, pageSize: 200, sortBy: 'name', sortDirection: 'asc' }
    ).subscribe({
      next: res => {
        if (res.isSuccess && res.data) {
          this.warehouses.set(res.data.items.map(w => ({ id: w.id, name: w.name })));
        }
      }
    });
  }

  onStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.pageIndex.set(0);
    this.loadData();
  }

  onRoleFilter(selectedValues: string[]): void {
    this.selectedRoleIds.set(selectedValues);
    this.roleFilter.set(selectedValues.length > 0 ? selectedValues.join(',') : '');
    this.pageIndex.set(0);
    this.loadData();
  }

  clearFilters(): void {
    this.statusFilter.set('');
    this.roleFilter.set('');
    this.selectedRoleIds.set([]);
    this.pageIndex.set(0);
    if (this.search.value !== '') {
      this.search.setValue('');
    } else {
      this.loadData();
    }
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadData();
  }

  onSort(sort: Sort): void {
    this.sortBy.set(sort.active);
    this.sortDirection.set(sort.direction || 'desc');
    this.pageIndex.set(0);
    this.loadData();
  }

  openCreateDialog(): void {
    const ref = this.dialogService.open({
      title: "Create User", submitLabel: "Create"
    },
      CreateUserDialog,
      {
        warehouses: this.warehouses()
      }
    );

    ref.afterClosed().subscribe(res => {
      if (res) this.loadData();
    })
  }

  openEditRoleDialog(user: UserSummaryResponse): void {
    const ref = this.dialogService.open({
      title: "Change Role", submitLabel: "Update"
    },
      EditUserRoleDialog,
      {
        user, warehouses: this.warehouses()
      }
    );

    ref.afterClosed().subscribe(res => {
      if (res) this.loadData();
    })
  }

  openEditWarehouseDialog(user: UserSummaryResponse): void {
    const ref = this.dialogService.open({
      title: "Change Warehouse", submitLabel: "Update"
    },
      EditUserWarehouseDialog,
      {
        user, warehouses: this.warehouses()
      }
    );

    ref.afterClosed().subscribe(res => {
      if (res) this.loadData();
    })
  }

  toggleStatus(user: UserSummaryResponse): void {
    if (user.role === 'Administrator') return;

    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';

    this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: `${newStatus} User`,
        message: `Are you sure you want to ${newStatus} User?`,
        confirmText: newStatus,
      },
    })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;

        this.service.updateUserStatus(user.id, { status: newStatus }).subscribe({
          next: res => {
            if (res.isSuccess) {
              this.toast.success(`User ${newStatus.toLowerCase()} successfully.`);
              this.loadData();
            } else {
              this.toast.error(res.message ?? 'Failed to update status.');
            }
          }
        });
      });
  }

  openDeleteDialog(user: UserSummaryResponse): void {
    if (user.role === 'Administrator') return;

    const ref = this.dialog.open(ConfirmDialog, {
      width: "500px",
      data: {
        title: `Delete User`,
        message: `Are you sure you want to Delete User?`,
        confirmText: "Delete",
      },

    }).afterClosed()
      .subscribe(result => {
        
        if (!result) return;

        this.service.deleteUser(user.id).subscribe({
          next: res => {
            if (res.isSuccess) {
              this.toast.success(res.data ?? `User Deleted successfully.`);
              this.loadData();
            } else {
              this.toast.error(res.message ?? 'Failed to Delete User.');
            }
          }
        })
      })
  }

  canChangeWarehouse(user: UserSummaryResponse): boolean {
    return user.role === 'WarehouseManager' || user.role === 'StockKeeper';
  }

}
