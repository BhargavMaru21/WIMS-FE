import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PurchaseOrderService } from '../purchase-order/services/po-service';
import { PoItemResponse, PoResponse, ProductDropdown } from '../purchase-order/models/po-models';
import { ProductService } from '../../admin/product-management/services/product-service';
import { DialogService } from '../../../core/services/dialog-service';
import { ToastService } from '../../../core/services/toast-service';
import { InputComponent } from '../../../shared/components/input/input';
import { PoItemForm } from './components/po-item-form/po-item-form';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { MatTooltip } from "@angular/material/tooltip";

@Component({
  selector: 'app-purchase-order-item',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    InputComponent,
    MatTooltip
],
  templateUrl: './purchase-order-item.html',
  styleUrl: './purchase-order-item.scss',
})
export class PurchaseOrderItem implements OnInit {
  private readonly service = inject(PurchaseOrderService);
  private readonly productService = inject(ProductService);
  private readonly dialogSvc = inject(DialogService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  poId = signal(0);
  po = signal<PoResponse | null>(null);
  loading = signal(false);

  displayedColumns = ['productName', 'orderedQty', 'unitPrice', 'lineTotal', 'receivedQty', 'actions'];
  dataSource = new MatTableDataSource<PoItemResponse>();

  search = new FormControl('', [Validators.maxLength(100)]);
  sortBy = signal('productName');
  sortDirection = signal('asc');

  allProducts = signal<ProductDropdown[]>([]);

  get canManageItems(): boolean {
    return this.po()?.canEdit ?? false;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.poId.set(id);

    this.search.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.applyFilter());

    this.loadPo();
    this.loadProducts();
  }

  loadPo(): void {
    this.loading.set(true);
    this.service.getPoById(this.poId()).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: res => {
        if (res.isSuccess && res.data) {
          this.po.set(res.data);
          this.dataSource.data = this.sortItems(res.data.items);
        }
      }
    });
  }

  loadProducts(): void {
    this.productService.getProducts({ pageNumber: 1, pageSize: 100, sortDirection: 'asc' }, { Status: 'Active' }).subscribe({
      next: res => {
        if (res.isSuccess && res.data) {
          this.allProducts.set(res.data.items.map(p => ({
            id: p.id,
            name: p.name,
            unitPrice: p.unitPrice
          })));
        }
      }
    });
  }

  applyFilter(): void {
    const term = (this.search.value ?? '').toLowerCase().trim();
    const items = this.po()?.items ?? [];

    const filtered = !term ? items : items.filter(i => i.productName.toLowerCase().includes(term));

    this.dataSource.data = this.sortItems(filtered);
  }

  searchError(): string {
    if (!this.search || !(this.search.dirty || this.search.touched)) return '';
    if (this.search.hasError('maxlength')) return 'Search value must not exceed 100 characters.';
    return '';
  }

  onSort(sort: Sort): void {
    this.sortBy.set(sort.active);
    this.sortDirection.set(sort.direction || 'asc');
    this.applyFilter();
  }

  private sortItems(items: PoItemResponse[]): PoItemResponse[] {
    const field = this.sortBy() as keyof PoItemResponse;
    const dir = this.sortDirection() === 'desc' ? -1 : 1;

    return [...items].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];
      if (typeof valA === 'number' && typeof valB === 'number') return (valA - valB) * dir;
      return String(valA).localeCompare(String(valB)) * dir;
    });
  }

  goBack(): void {
    this.router.navigate(['/manager/purchase-orders']);
  }

  clearFilters(): void{
    this.search.setValue('')
  }

  openAddItemDialog(): void {
    const ref = this.dialogSvc.open(
      { title: 'Add Item' },
      PoItemForm,
      { poId: this.poId(), products: this.allProducts() },
    );
    ref.afterClosed().subscribe(result => {
      if (result) this.loadPo();
    });
  }

  openEditItemDialog(item: PoItemResponse): void {
    const ref = this.dialogSvc.open(
      { title: 'Edit Item' },
      PoItemForm,
      { poId: this.poId(), item, products: this.allProducts() },
    );
    ref.afterClosed().subscribe(result => {
      if (result) this.loadPo();
    });
  }

  removeItem(item: PoItemResponse): void {
    this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Remove Item',
        message: `Remove "${item.productName}" from this purchase order?`,
        confirmText: 'Remove',
      }
    }).afterClosed().subscribe(confirm => {
      if (!confirm) return;

      this.service.removeItem(this.poId(), item.id).subscribe({
        next: res => {
          if (res.isSuccess) {
            this.toast.success('Item removed.');
            this.loadPo();
          }
        }
      });
    });
  }

  statusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }
}