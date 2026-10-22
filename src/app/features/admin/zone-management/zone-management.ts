import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputComponent } from "../../../shared/components/input/input";
import { WarehouseManagementService } from '../warehouse-management/services/warehouse-service';
import { ToastService } from '../../../core/services/toast-service';
import { WarehouseDropdown, WarehouseResponse, ZoneResponse } from '../warehouse-management/models/warehouse-models';
import { MatDialog } from '@angular/material/dialog';
import { ZoneCreateDialog } from './components/zone-form-dialog/zone-form-dialog';
import { DialogService } from '../../../core/services/dialog-service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-zone-management',
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
  templateUrl: './zone-management.html',
  styleUrl: './zone-management.scss',
})
export class ZoneManagement implements OnInit {
  private readonly service = inject(WarehouseManagementService);
  private readonly toast = inject(ToastService);
  private readonly dialogSvc = inject(DialogService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  displayedColumns = ['code', 'name', 'warehouse', 'status', 'actions'];
  dataSource = new MatTableDataSource<ZoneResponse>();

  loading = signal(false);
  totalCount = signal(0);

  search = new FormControl('', [Validators.maxLength(100)]);
  statusFilter = signal('');
  warehouseFilter = signal('');

  selectedWarehouseIds = signal<number[]>([]);

  pageSize = signal(5);
  pageIndex = signal(0);
  sortBy = signal('createdAt');
  sortDirection = signal('desc');

  statusOptions = ['Active', 'Inactive'];
  warehouseOptions = signal<WarehouseDropdown[]>([]);

  ngOnInit(): void {
    this.search.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
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
    if (this.warehouseFilter()) filters['WarehouseId'] = this.warehouseFilter();

    this.service
      .getZones(
        {
          pageNumber: this.pageIndex() + 1,
          pageSize: this.pageSize(),
          search: this.search.value ?? '',
          sortBy: this.sortBy(),
          sortDirection: this.sortDirection(),
        },
        filters,
      )
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.dataSource.data = res.data.items;
            this.totalCount.set(res.data.totalCount);
          }
        },
      });
  }

  loadWarehouses(): void {
    this.service
      .getWarehouses({ pageNumber: 1, pageSize: 100, sortBy: 'name', sortDirection: 'asc' })
      .subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            let data = res.data.items.map(
              (val: WarehouseResponse): WarehouseDropdown => ({
                id: val.id,
                name: val.name,
              }),
            );

            this.warehouseOptions.set(data);
          }
        },
      });
  }

  onStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.pageIndex.set(0);
    this.loadData();
  }

  onWarehouseFilter(value: number[]): void {
    this.selectedWarehouseIds.set(value);
    this.warehouseFilter.set(value.length > 0 ? value.join(',') : '');
    this.pageIndex.set(0);
    this.loadData();
  }

  clearFilters(): void {
    this.statusFilter.set('');
    this.warehouseFilter.set('');
    this.selectedWarehouseIds.set([]);
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
      {
        title: 'Create Zone',
        submitLabel: 'Create',
      },
      ZoneCreateDialog,
      {
        warehouseOptions: this.warehouseOptions(),
      },
    );

    ref.afterClosed().subscribe((res) => {
      if (res) this.loadData();
    });
  }

  openEditDialog(zone: ZoneResponse): void {
    const ref = this.dialogSvc.open(
      {
        title: 'Edit Zone',
        submitLabel: 'Update',
      },
      ZoneCreateDialog,
      { zone, warehouseOptions: this.warehouseOptions() },
    );

    ref.afterClosed().subscribe((res) => {
      if (res) this.loadData();
    });
  }

  toggleStatus(zone: ZoneResponse): void {
    const newStatus = zone.status === 'Active' ? 'Inactive' : 'Active';

    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        data: {
          title: `${newStatus} Zone`,
          message: `Are you sure you want to ${newStatus} Zone?`,
          confirmText: newStatus,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;

        this.service.updateZoneStatus(zone.id, { status: newStatus }).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toast.success(`Zone ${newStatus.toLowerCase()} successfully.`);
              this.loadData();
            } else {
              this.toast.error(res.message ?? 'Failed to update status.');
            }
          },
        });
      });
  }

  openDeleteDialog(zone: ZoneResponse) {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        data: {
          title: `Delete Zone`,
          message: `Are you sure you want to Delete Zone?`,
          confirmText: 'Delete',
        },
      })
      .afterClosed()
      .subscribe((confirm) => {
        if (!confirm) return;

        this.service.deleteZone(zone.id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toast.success('Zone and related Bins Deleted successfully.');
              this.loadData();
            } else {
              this.toast.error(res.message ?? 'Failed to Delete Zone.');
            }
          },
        });
      });
  }
}