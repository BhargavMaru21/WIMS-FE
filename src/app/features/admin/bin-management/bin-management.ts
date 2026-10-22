import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputComponent } from '../../../shared/components/input/input';
import { DialogService } from '../../../core/services/dialog-service';
import { ToastService } from '../../../core/services/toast-service';
import { WarehouseManagementService } from '../warehouse-management/services/warehouse-service';
import { BinResponse, WarehouseDropdown, ZoneDropdown, ZoneResponse } from '../warehouse-management/models/warehouse-models';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { BinFormDialog } from './components/bin-form-dialog/bin-form-dialog';

@Component({
  selector: 'app-bin-management',
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
  templateUrl: './bin-management.html',
  styleUrl: './bin-management.scss',
})
export class BinManagement implements OnInit {
  private readonly service = inject(WarehouseManagementService);
  private readonly dialogSvc = inject(DialogService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  displayedColumns = ['code', 'name', 'zoneName', 'warehouseName', 'maxCapacity', 'status', 'actions'];
  dataSource = new MatTableDataSource<BinResponse>();

  loading = signal(false);
  totalCount = signal(0);

  search = new FormControl('', [Validators.maxLength(100)]);
  statusFilter = signal('');

  warehouseFilter = signal('');
  zoneFilter = signal('');

  selectedWarehouseIds = signal<number[]>([]);
  selectedZoneIds = signal<number[]>([]);

  pageSize = signal(5);
  pageIndex = signal(0);
  sortBy = signal('createdAt');
  sortDirection = signal('desc');

  statusOptions = ['Active', 'Inactive'];
  allWarehouses = signal<WarehouseDropdown[]>([]);
  allZones = signal<ZoneDropdown[]>([]);

  ngOnInit(): void {
    this.search.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.pageIndex.set(0)
      this.loadData()
    });

    this.loadWarehouses();
    this.loadZones();
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
    if (this.zoneFilter()) filters['ZoneId'] = this.zoneFilter();

    this.service.getBins(
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
    this.service.getWarehouses(
      { pageNumber: 1, pageSize: 200, sortBy: 'name', sortDirection: 'asc' }
    ).subscribe({
      next: res => {
        if (res.isSuccess && res.data) {
          this.allWarehouses.set(
            res.data.items.map(w => ({ id: w.id, name: w.name }))
          );
        }
      }
    });
  }

  loadZones(): void {
    this.service.getZonesDropdown().subscribe({
      next: res => {
        if (res.isSuccess && res.data) {
          this.allZones.set(res.data)
        }
      }
    });
  }

  onStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.pageIndex.set(0);
    this.loadData();
  }

  onWarehouseFilter(selectedIds: number[]): void {
    let zoneIdArray = this.allZoneOfSelectedWarehouse(selectedIds)

    this.selectedWarehouseIds.set(selectedIds);
    this.warehouseFilter.set(selectedIds.length > 0 ? selectedIds.join(',') : '');

    this.selectedZoneIds.set(zoneIdArray);
    if (zoneIdArray.length > 0) this.zoneFilter.set(this.selectedZoneIds().join(','))
    else if (zoneIdArray.length == 0 && this.selectedWarehouseIds().length > 0) this.zoneFilter.set('-1')
    else this.zoneFilter.set('')
    this.pageIndex.set(0);
    this.loadData();
  }

  private allZoneOfSelectedWarehouse(warehouseIds: number[]): number[] {
    if (warehouseIds.length == 0) return [];
    var filterZonesArray = warehouseIds.map((id) => this.allZones().filter((zone) => zone.warehouseId == id));
    var zoneIds = filterZonesArray.flat().map(zone => zone.id)

    return zoneIds;
  }

  onZoneFilter(selectedIds: number[]): void {
    this.selectedZoneIds.set(selectedIds);
    if (selectedIds.length > 0) {
      this.zoneFilter.set(selectedIds.join(','))
    } else {
      this.zoneFilter.set('')
      this.selectedWarehouseIds.set([])
      this.warehouseFilter.set('')
    }
    this.pageIndex.set(0);
    this.loadData();
  }

  isZoneDisabled(zone: ZoneDropdown): boolean {
    const selected = this.selectedWarehouseIds();
    if (selected.length === 0) return false;
    return !selected.includes(zone.warehouseId);
  }

  clearFilters(): void {
    this.statusFilter.set('');
    this.warehouseFilter.set('');
    this.zoneFilter.set('');
    this.selectedWarehouseIds.set([]);
    this.selectedZoneIds.set([]);
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
      { title: 'Create Bin', submitLabel: "Create" },
      BinFormDialog,
      { warehouses: this.allWarehouses(), zones: this.allZones() },
    );
    ref.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  openEditDialog(bin: BinResponse): void {
    const ref = this.dialogSvc.open(
      { title: 'Edit Bin', submitLabel: "Update" },
      BinFormDialog,
      { bin, warehouses: this.allWarehouses(), zones: this.allZones() },
    );
    ref.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  toggleStatus(bin: BinResponse): void {
    const newStatus = bin.status === 'Active' ? 'Inactive' : 'Active';
    this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: `${newStatus} Bin`,
        message: `Are you sure you want to ${newStatus.toLowerCase()} this bin?`,
        confirmText: newStatus,
      }
    }).afterClosed().subscribe(confirm => {
      if (!confirm) return;
      this.service.updateBinStatus(bin.id, { status: newStatus }).subscribe({
        next: res => {
          if (res.isSuccess) {
            this.toast.success(`Bin ${newStatus.toLowerCase()} successfully.`);
            this.loadData();
          } else {
            this.toast.error(res.message ?? 'Failed to update status.');
          }
        }
      });
    });
  }

  openDeleteDialog(bin: BinResponse): void {
    this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Delete Bin',
        message: 'Are you sure you want to delete this bin?',
        confirmText: 'Delete',
      }
    }).afterClosed().subscribe(confirm => {
      if (!confirm) return;
      this.service.deleteBin(bin.id).subscribe({
        next: res => {
          if (res.isSuccess) {
            this.toast.success(res.data ?? 'Bin deleted successfully.');
            this.loadData();
          } else {
            this.toast.error(res.message ?? 'Failed to delete bin.');
          }
        }
      });
    });
  }
}


