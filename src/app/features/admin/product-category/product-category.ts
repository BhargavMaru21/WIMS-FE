import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ProductCategoryService } from './services/product-category-service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounce, debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ProductCategoryResponse } from './models/product-category-models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from '../../../core/services/dialog-service';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../../core/services/toast-service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { InputComponent } from '../../../shared/components/input/input';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { ProductCategoryFormDialog } from './components/product-category-form-dialog/product-category-form-dialog';

@Component({
  selector: 'app-product-category',
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
  templateUrl: './product-category.html',
  styleUrl: './product-category.scss',
})
export class ProductCategory {
  private readonly service = inject(ProductCategoryService)
  private readonly dialogSvc = inject(DialogService);
  private readonly dialog = inject(MatDialog)
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef)

  loading = signal(false);
  totalCount = signal(0);

  displayedColumns = ['id', 'name', 'description', 'status', 'actions'];
  dataSource = new MatTableDataSource<ProductCategoryResponse>();

  search = new FormControl('', [Validators.maxLength(100)]);
  statusFilter = signal('');

  pageSize = signal(5);
  pageIndex = signal(0);
  sortBy = signal('createdAt');
  sortDirection = signal('desc');

  statusOptions = ['Active', 'Inactive'];

  ngOnInit() {
    this.search.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: res => {
        this.pageIndex.set(0);
        this.loadData()
      }
    })
    this.loadData();
  }

  searchError(): string {
    if (!this.search || !(this.search.dirty || this.search.touched)) return '';
    if (this.search.hasError('maxlength')) return 'Search value must not exceed 100 characters.';
    return '';
  }


  loadData() {
    this.loading.set(true);

    const filters: Record<string, string> = {};
    if (this.statusFilter()) filters['Status'] = this.statusFilter();


    this.service.getProductCategories(
      {
        pageNumber: this.pageIndex() + 1,
        pageSize: this.pageSize(),
        search: this.search.value ?? '',
        sortBy: this.sortBy(),
        sortDirection: this.sortDirection(),
      },
      filters
    ).pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => {
          if (res.isSuccess && res.data) {
            this.dataSource.data = res.data.items;
            this.totalCount.set(res.data.totalCount)
          }
        }
      })
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
      { title: 'Create Product Category', submitLabel: "Create" },
      ProductCategoryFormDialog,
    );
    ref.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  openEditDialog(category: ProductCategoryResponse): void {
    const ref = this.dialogSvc.open(
      { title: 'Edit Product Category', submitLabel: "Update" },
      ProductCategoryFormDialog,
      { category },
    );
    ref.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  openDeleteDialog(productCategory: ProductCategoryResponse) {
    this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: `Delete ProductCategory`,
        message: `Are you sure you want to Delete ProductCategory?`,
        confirmText: "Delete"
      }
    })
      .afterClosed()
      .subscribe((confirm) => {
        if (!confirm) return;

        this.service.deleteProductCategory(productCategory.id).subscribe({
          next: res => {
            if (res.isSuccess) {
              this.toast.success(res.data ?? "ProductCategory Deleted successfully.");
              this.loadData();
            } else {
              this.toast.error(res.message ?? 'Failed to Delete Warehouse.');
            }
          }
        })
      })
  }


  toggleStatus(productCategory: ProductCategoryResponse) {
    const newStatus = productCategory.status === 'Active' ? 'Inactive' : 'Active';

    this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: `${newStatus} ProductCategory`,
        message: `Are you sure you want to ${newStatus} ProductCategory?`,
        confirmText: newStatus
      }
    })
      .afterClosed()
      .subscribe((confirm) => {
        if (!confirm) return;

        this.service.updateProductCategoryStatus(productCategory.id, { status: newStatus }).subscribe({
          next: res => {
            if (res.isSuccess) {
              this.toast.success(`ProductCategory ${newStatus.toLowerCase()} successfully.`);
              this.loadData();
            } else {
              this.toast.error(res.message ?? 'Failed to update status.');
            }
          }
        });
      })
  }

}
