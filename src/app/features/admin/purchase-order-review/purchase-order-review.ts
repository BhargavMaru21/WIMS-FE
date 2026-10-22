import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputComponent } from '../../../shared/components/input/input';
import { DialogService } from '../../../core/services/dialog-service';
import { ToastService } from '../../../core/services/toast-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PurchaseOrderService } from '../../manager/purchase-order/services/po-service';
import { PO_STATUS, PoResponse, PoStatus } from '../../manager/purchase-order/models/po-models';
import { PoRejectDialog } from '../../manager/purchase-order/components/po-reject-dialog/po-reject-dialog';
import { WarehouseManagementService } from '../warehouse-management/services/warehouse-service';

interface WarehouseDropdown {
  id: number;
  name: string;
}

@Component({
  selector: 'app-purchase-order-review',
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
    InputComponent,
  ],
  templateUrl: './purchase-order-review.html',
  styleUrl: './purchase-order-review.scss',
})
export class PurchaseOrderReview implements OnInit {
  private readonly service = inject(PurchaseOrderService);
  private readonly warehouseService = inject(WarehouseManagementService);
  private readonly dialogService = inject(DialogService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  displayedColumns = ['poNumber', 'supplierName', 'warehouseName', 'orderDate', 'expectedDelivery', 'totalAmount', 'status', 'actions'];
  dataSource = new MatTableDataSource<PoResponse>();

  loading = signal(false);
  totalCount = signal(0);

  search = new FormControl('', [Validators.maxLength(100)]);
  statusFilter = signal('');
  selectedWarehouseIds = signal<number[]>([]);

  pageSize = signal(10);
  pageIndex = signal(0);
  sortBy = signal('createdAt');
  sortDirection = signal('desc');

  statusOptions = ['Submitted', 'Approved', 'PartiallyReceived', 'FullyReceived', 'Rejected', 'Cancelled'];
  allWarehouses = signal<WarehouseDropdown[]>([]);

  ngOnInit(): void {
    this.search.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
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

  loadWarehouses(): void {
    this.warehouseService.getWarehouses({ pageNumber: 1, pageSize: 100, sortDirection: 'asc' }, { Status: 'Active' }).subscribe({
      next: res => {
        if (res.isSuccess && res.data) {
          this.allWarehouses.set(res.data.items.map(w => ({ id: w.id, name: w.name })));
        }
      }
    });
  }

  loadData(): void {
    this.loading.set(true);

    const filters: Record<string, string> = {};
    if (this.statusFilter()) filters['Status'] = this.statusFilter();
    if (this.selectedWarehouseIds().length > 0) filters['WarehouseId'] = this.selectedWarehouseIds().join(',');

    this.service.getPos(
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

  onWarehouseFilter(selectedIds: number[]): void {
    this.selectedWarehouseIds.set(selectedIds);
    this.pageIndex.set(0);
    this.loadData();
  }

  clearFilters(): void {
    this.statusFilter.set('');
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

  goToItems(po: PoResponse): void {
    this.router.navigate(['/admin/purchase-orders', po.id, 'items']);
  }

  approvePo(po: PoResponse): void {
    this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Approve Purchase Order',
        message: `Approve "${po.poNumber}" from ${po.supplierName} for ${po.warehouseName}?`,
        confirmText: 'Approve',
      }
    }).afterClosed().subscribe(confirm => {
      if (!confirm) return;

      let status : PoStatus = PO_STATUS.approve as PoStatus;
      
      this.service.updatePoStatus(po.id,{status}).subscribe({
        next: res => {
          if (res.isSuccess) {
            this.toast.success(res.data ?? 'Purchase order approved.');
            this.loadData();
          }
        }
      });
    });
  }

  rejectPo(po: PoResponse): void {
    const ref = this.dialogService.open(
      { title: 'Reject Purchase Order' },
      PoRejectDialog,
      { poId: po.id, poNumber: po.poNumber },
    );
    ref.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  hasMenuActions(po: PoResponse): boolean {
    return po.status === 'Submitted' && po.canApprove;
  }

  statusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }
}