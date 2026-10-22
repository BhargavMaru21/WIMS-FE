import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged, filter, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from '../../../core/services/dialog-service';
import { ToastService } from '../../../core/services/toast-service';
import { WarehouseFormDialogComponent } from './components/warehouse-form-dialog/warehouse-form-dialog';
import { WarehouseManagementService } from './services/warehouse-service';
import { WarehouseResponse } from './models/warehouse-models';
import { InputComponent } from '../../../shared/components/input/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-warehouse-management',
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
  templateUrl: './warehouse-management.html',
  styleUrl: './warehouse-management.scss',
})
export class WarehouseManagement implements OnInit {
  private readonly service = inject(WarehouseManagementService);
  private readonly dialogSvc = inject(DialogService);
  private readonly dialog = inject(MatDialog)
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);


  displayedColumns = ['code', 'name', 'city', 'contactPerson', 'contactPhone', 'status', 'actions'];
  dataSource = new MatTableDataSource<WarehouseResponse>();

  loading = signal(false);
  totalCount = signal(0);

  search = new FormControl('', [Validators.maxLength(100)]);
  statusFilter = signal('');

  pageSize = signal(5);
  pageIndex = signal(0);
  sortBy = signal('createdAt');
  sortDirection = signal('desc');

  statusOptions = ['Active', 'Inactive'];

  ngOnInit(): void {
    this.search.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.pageIndex.set(0);
      this.loadData();
    });

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

    this.service.getWarehouses(
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

  onStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.pageIndex.set(0);
    this.loadData();
  }

  clearFilters(): void {
    this.statusFilter.set('');
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
    const ref = this.dialogSvc.open(
      { title: 'Create Warehouse' },
      WarehouseFormDialogComponent,
    );
    ref.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  openEditDialog(warehouse: WarehouseResponse): void {
    const ref = this.dialogSvc.open(
      { title: 'Edit Warehouse' },
      WarehouseFormDialogComponent,
      { warehouse },
    );
    ref.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  toggleStatus(warehouse: WarehouseResponse): void {
    const newStatus = warehouse.status === 'Active' ? 'Inactive' : 'Active';

    this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: `${newStatus} Warehouse`,
        message: `Are you sure you want to ${newStatus} Warehouse?`,
        confirmText: newStatus
      }
    })
      .afterClosed()
      .subscribe((confirm) => {
        if (!confirm) return;

        this.service.updateWarehouseStatus(warehouse.id, { status: newStatus }).subscribe({
          next: res => {
            if (res.isSuccess) {
              this.toast.success(`Warehouse ${newStatus.toLowerCase()} successfully.`);
              this.loadData();
            } else {
              this.toast.error(res.message ?? 'Failed to update status.');
            }
          }
        });
      })
  }

  openDeleteDialog(warehouse: WarehouseResponse) {
    this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: `Delete Warehouse`,
        message: `Are you sure you want to Delete Warehouse?`,
        confirmText: "Delete"
      }
    })
      .afterClosed()
      .subscribe((confirm) => {
        if (!confirm) return;

        this.service.deleteWarehouse(warehouse.id).subscribe({
          next: res => {
            if (res.isSuccess) {
              this.toast.success(res.data ?? "Warehouse and related Zones & Bins Deleted successfully.");
              this.loadData();
            } else {
              this.toast.error(res.message ?? 'Failed to Delete Warehouse.');
            }
          }
        })
      })
  }
}