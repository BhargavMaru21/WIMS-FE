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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputComponent } from '../../../shared/components/input/input';
import { DialogService } from '../../../core/services/dialog-service';
import { ToastService } from '../../../core/services/toast-service';
import { AuthService } from '../../../core/services/auth-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PurchaseOrderService } from './services/po-service';
import { PO_STATUS, PoResponse, PoStatus } from './models/po-models';
import { PoFormDialog } from './components/po-form-dialog/po-form-dialog';
import { PoRejectDialog } from './components/po-reject-dialog/po-reject-dialog';

@Component({
  selector: 'app-purchase-order-management',
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
    MatTooltipModule,
    InputComponent,
  ],
  templateUrl: './purchase-order.html',
  styleUrl: './purchase-order.scss',
})
export class PurchaseOrder implements OnInit {
  private readonly service = inject(PurchaseOrderService);
  private readonly dialogSvc = inject(DialogService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  displayedColumns = ['poNumber', 'supplierName', 'orderDate', 'expectedDelivery', 'totalAmount', 'status', 'actions'];
  dataSource = new MatTableDataSource<PoResponse>();

  loading = signal(false);
  totalCount = signal(0);

  search = new FormControl('', [Validators.maxLength(100)]);
  statusFilter = signal('');

  pageSize = signal(10);
  pageIndex = signal(0);
  sortBy = signal('createdAt');
  sortDirection = signal('desc');

  statusOptions = ['Draft', 'Submitted', 'Approved','PartiallyReceived', 'FullyReceived', 'Rejected', 'Cancelled'];

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
      { title: 'Create Purchase Order' },
      PoFormDialog,
      {},
      "700px"
    );
    ref.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  openEditDialog(po: PoResponse): void {
    const ref = this.dialogSvc.open(
      { title: 'Edit Purchase Order' },
      PoFormDialog,
      { po },
    );
    ref.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  goToItems(po: PoResponse): void {
    this.router.navigate(['/manager/purchase-order', po.id, 'items']);
  }

  submitPo(po: PoResponse): void {
    this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Submit Purchase Order',
        message: `Submit "${po.poNumber}" for approval?`,
        confirmText: 'Submit',
      }
    }).afterClosed().subscribe(confirm => {
      if (!confirm) return;

      let status : PoStatus = PO_STATUS.submit as PoStatus;

      this.service.updatePoStatus(po.id,{status}).subscribe({
        next: res => {
          if (res.isSuccess) {
            this.toast.success(res.data ?? 'Purchase order submitted for approval.');
            this.loadData();
          }
        }
      });
    });
  }

  approvePo(po: PoResponse): void {
    this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Approve Purchase Order',
        message: `Approve "${po.poNumber}" from ${po.supplierName}?`,
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
    const ref = this.dialogSvc.open(
      { title: 'Reject Purchase Order' },
      PoRejectDialog,
      { poId: po.id, poNumber: po.poNumber },
    );
    ref.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  cancelPo(po: PoResponse): void {
    this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Cancel Purchase Order',
        message: `Are you sure you want to cancel "${po.poNumber}"? `,
        confirmText: 'Cancel Order',
      }
    }).afterClosed().subscribe(confirm => {
      if (!confirm) return;

      let status : PoStatus = PO_STATUS.cancel as PoStatus;

      this.service.updatePoStatus(po.id,{status}).subscribe({
        next: res => {
          if (res.isSuccess) {
            this.toast.success(res.data ?? 'Purchase order cancelled.');
            this.loadData();
          }
        }
      });
    });
  }

  hasMenuActions(po: PoResponse): boolean {
    if (po.canEdit) return true;
    if (po.status === 'Submitted') return true;
    return false;
  }

  statusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }
}