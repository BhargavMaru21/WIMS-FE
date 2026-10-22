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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputComponent } from '../../../shared/components/input/input';
import { DialogService } from '../../../core/services/dialog-service';
import { ToastService } from '../../../core/services/toast-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { ProductService } from './services/product-service';
import { ProductCategoryService } from '../product-category/services/product-category-service';
import { ProductResponse, UomResponse } from './models/product-models';
import { ProductFormDialog } from './components/product-form-dialog/product-form-dialog';
import { UomDialog } from './components/uom-dialog/uom-dialog';
import { ProductDetailDialog } from './components/product-detail-dialog/product-detail-dialog';
import { ProductCategoryDropdownResponse } from '../product-category/models/product-category-models';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-product-management',
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
    MatTooltipModule,
    InputComponent,
  ],
  templateUrl: './product-management.html',
  styleUrl: './product-management.scss',
})
export class ProductManagement implements OnInit {
  private readonly service = inject(ProductService);
  private readonly categorySvc = inject(ProductCategoryService);
  private readonly dialogSvc = inject(DialogService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly http = inject(HttpClient)

  displayedColumns = ['sku', 'name', 'categoryName', 'unitOfMeasure', 'unitPrice', 'reorderLevel', 'status', 'actions'];
  dataSource = new MatTableDataSource<ProductResponse>();

  loading = signal(false);
  importing = signal(false);
  exporting = signal(false);
  totalCount = signal(0);

  search = new FormControl('', [Validators.maxLength(100)]);
  statusFilter = signal('');
  categoryFilter = signal('');
  selectedCategoryIds = signal<number[]>([]);

  pageSize = signal(10);
  pageIndex = signal(0);
  sortBy = signal('createdAt');
  sortDirection = signal('desc');

  statusOptions = ['Active', 'Inactive'];
  allCategories = signal<ProductCategoryDropdownResponse[]>([]);
  allUoms = signal<UomResponse[]>([]);

  ngOnInit(): void {
    this.search.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.pageIndex.set(0);
      this.loadData();
    });

    this.loadCategories();
    this.loadUoms();
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
    if (this.categoryFilter()) filters['CategoryId'] = this.categoryFilter();

    this.service.getProducts(
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

  loadCategories(): void {
    this.categorySvc.getProductCategoryDropdown().subscribe({
      next: res => {
        if (res.isSuccess && res.data) {
          this.allCategories.set(res.data);
        }
      }
    });
  }

  loadUoms(): void {
    this.service.getAllUoms().subscribe({
      next: res => {
        if (res.isSuccess && res.data) {
          this.allUoms.set(res.data);
        }
      }
    });
  }

  onStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.pageIndex.set(0);
    this.loadData();
  }

  onCategoryFilter(selectedIds: number[]): void {
    this.selectedCategoryIds.set(selectedIds);
    this.categoryFilter.set(selectedIds.length > 0 ? selectedIds.join(',') : '');
    this.pageIndex.set(0);
    this.loadData();
  }

  clearFilters(): void {
    this.statusFilter.set('');
    this.categoryFilter.set('');
    this.selectedCategoryIds.set([]);
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
      { title: 'Create Product' },
      ProductFormDialog,
      { categories: this.allCategories(), uoms: this.allUoms() },
    );
    ref.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  openEditDialog(product: ProductResponse): void {
    const ref = this.dialogSvc.open(
      { title: 'Edit Product' },
      ProductFormDialog,
      { product, categories: this.allCategories(), uoms: this.allUoms() },
    );
    ref.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  openUomDialog(): void {
    const ref = this.dialogSvc.open(
      { title: 'Units of Measure', hideFooter: true },
      UomDialog,
      {},
      '560px',
    );
    ref.afterClosed().subscribe(result => {
      this.loadUoms();
    });
  }

  toggleStatus(product: ProductResponse): void {
    const newStatus = product.status === 'Active' ? 'Inactive' : 'Active';

    this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: `${newStatus} Product`,
        message: `Are you sure you want to ${newStatus.toLowerCase()} "${product.name}"?`,
        confirmText: newStatus,
      }
    }).afterClosed().subscribe(confirm => {
      if (!confirm) return;

      this.service.updateProductStatus(product.id, { status: newStatus }).subscribe({
        next: res => {
          if (res.isSuccess) {
            this.toast.success(`Product ${newStatus.toLowerCase()} successfully.`);
            this.loadData();
          } else {
            this.toast.error(res.message ?? 'Failed to update status.');
          }
        }
      });
    });
  }

  openDeleteDialog(product: ProductResponse): void {
    this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete "${product.name}".`,
        confirmText: 'Delete',
      }
    }).afterClosed().subscribe(confirm => {
      if (!confirm) return;

      this.service.deleteProduct(product.id).subscribe({
        next: res => {
          if (res.isSuccess) {
            this.toast.success(res.data ?? 'Product deleted successfully.');
            this.loadData();
          } else {
            this.toast.error(res.message ?? 'Failed to delete product.');
          }
        }
      });
    });
  }

  onImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      this.toast.error('Please upload a valid .xlsx file.');
      input.value = '';
      return;
    }

    this.importing.set(true);
    this.service.importProducts(file)
      .pipe(finalize(() => {
        this.importing.set(false);
        input.value = '';
      }))
      .subscribe({
        next: res => {
          if (res.isSuccess) {
            this.toast.success(res.message ?? 'Products imported successfully.');
            this.loadData();
          } else {
            this.toast.error(res.message ?? 'Import failed.');
          }
        }
      });
  }

  onExport(): void {
    this.exporting.set(true);
    this.service.exportProducts()
      .pipe(finalize(() => this.exporting.set(false)))
      .subscribe({
        next: blob => {
          console.log(blob);

          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Products_Export.xlsx`;
          a.click();
          a.remove()
          URL.revokeObjectURL(url);
          this.toast.success('Products exported successfully.');
        },
        error: () => {
          this.toast.error('Export failed. Please try again.');
        }
      });
  }

  openDetailDialog(product: ProductResponse): void {
    this.dialogSvc.open(
      { title: 'Product Details', hideFooter: true },
      ProductDetailDialog,
      { productId: product.id },
      '540px',
    );
  }
}