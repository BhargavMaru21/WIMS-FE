import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideNativeDateAdapter } from '@angular/material/core';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../../shared/components/input/input';
import { DialogComponent, DialogConfig } from '../../../../../shared/components/dialog/dialog';
import { ToastService } from '../../../../../core/services/toast-service';
import { PurchaseOrderService } from '../../services/po-service';
import { PoResponse, ProductDropdown } from '../../models/po-models';
import { ProductService } from '../../../../admin/product-management/services/product-service';

interface ItemRow {
  productId: number;
  orderedQty: number;
  touched: boolean;
}

@Component({
  selector: 'app-po-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    InputComponent,
    DialogComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './po-form-dialog.html',
  styleUrl: './po-form-dialog.scss',
})
export class PoFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PurchaseOrderService);
  private readonly productService = inject(ProductService)
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject(MatDialogRef<PoFormDialog>);
  readonly data: { config: DialogConfig; po?: PoResponse } = inject(MAT_DIALOG_DATA);

  loading = signal(false);
  isEdit = signal(false);
  allProducts = signal<ProductDropdown[]>([]);

  rows: ItemRow[] = [{ productId: 0, orderedQty: 1, touched: false }];

  minDate = new Date(Date.now() + 86400000);
  maxDate = new Date(2026, 11, 31);

  form = this.fb.group({
    supplierName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200), Validators.pattern(/^[a-zA-Z\s]+$/),]],
    supplierContact: ['', [Validators.pattern(/^(?:\+91[\-\s]?)?[6-9]\d{9}$/)]],
    expectedDelivery: [null as Date | null, Validators.required],
    notes: ['', [Validators.maxLength(1000)]],
  });

  get isFormReady(): boolean {
    if (this.form.invalid) return false;
    if (!this.isEdit()) {
      const validRows = this.rows.filter(r => r.productId > 0 && r.orderedQty > 0);
      if (validRows.length === 0) return false;
    }
    return true;
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl || !(ctrl.dirty || ctrl.touched)) return '';

    if (ctrl.hasError('required')) return `${field} is required.`;
    if (ctrl.hasError('minlength')) return `${field} must be at least 2 characters.`;
    if (ctrl.hasError('pattern')) return field === 'supplierName' ? 'Supplier Name can only contain letters and spaces.' : 'Supplier contact must be a valid Indian phone number.'
    if (ctrl.hasError('maxlength')) return field === 'supplierName' ? 'Supplier name must not exceed 200 characters.' : 'Notes must not exceed 1000 characters.';
    return '';
  }

  ngOnInit(): void {
    if (this.data.po) {
      this.isEdit.set(true);
      const po = this.data.po;
      this.form.patchValue({
        supplierName: po.supplierName,
        supplierContact: po.supplierContact ?? '',
        expectedDelivery: new Date(po.expectedDelivery),
        notes: po.notes ?? '',
      });
    }

    this.loadProducts()
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


  getProduct(productId: number): ProductDropdown | undefined {
    return this.allProducts().find(p => p.id === productId);
  }

  getLineTotal(row: ItemRow): number {
    const product = this.getProduct(row.productId);
    if (!product || row.orderedQty <= 0) return 0;
    return product.unitPrice * row.orderedQty;
  }

  getGrandTotal(): number {
    return this.rows.reduce((sum, row) => sum + this.getLineTotal(row), 0);
  }

  isDuplicateProduct(productId: number, currentIndex: number): boolean {
    if (productId === 0) return false;
    return this.rows.some((r, i) => i !== currentIndex && r.productId === productId);
  }

  rowError(row: ItemRow, index: number): string {
    if (!row.touched) return '';
    if (row.productId === 0) return 'Please select a product.';
    if (row.orderedQty <= 0) return 'Quantity must be greater than zero.';
    return '';
  }

  addRow(): void {
    this.rows.push({ productId: 0, orderedQty: 1, touched: false });
  }

  deleteRow(index: number): void {
    if (this.rows.length === 1) {
      this.toast.error('At least one item is required.');
      return;
    }
    this.rows.splice(index, 1);
  }


  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.isEdit()) {
      this.rows.forEach(r => r.touched = true);

      const validRows = this.rows.filter(r => r.productId > 0 && r.orderedQty > 0);

      if (validRows.length === 0) {
        this.toast.error('At least one item with a valid product and quantity is required.');
        return;
      }

      const hasErrors = this.rows.some((r, i) =>
        r.productId === 0 ||
        r.orderedQty <= 0 ||
        this.isDuplicateProduct(r.productId, i)
      );

      if (hasErrors) {
        this.toast.error('Please fix item errors before saving.');
        return;
      }
    }

    this.loading.set(true);
    const raw = this.form.getRawValue();
    
    const expectedDelivery = this.toDateOnlyString(raw.expectedDelivery!);

    const orderItems = this.rows.map(r => ({
      productId: r.productId,
      orderedQty: r.orderedQty,
    }))

    const request$ = this.isEdit()
      ? this.service.updatePo(this.data.po!.id, {
        supplierName: raw.supplierName!,
        supplierContact: raw.supplierContact || undefined,
        expectedDelivery,
        notes: raw.notes || undefined,
      })
      : this.service.createPo({
        supplierName: raw.supplierName!,
        supplierContact: raw.supplierContact || undefined,
        expectedDelivery,
        notes: raw.notes || undefined,
        itemList: orderItems,
      });

    request$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.toast.success(this.isEdit() ? 'Purchase order updated.' : 'Purchase order created.');
          this.dialogRef.close(true);
        }
      }
    });
  }

  private toDateOnlyString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}