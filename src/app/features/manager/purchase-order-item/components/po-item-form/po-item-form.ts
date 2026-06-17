import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../../shared/components/input/input';
import { DialogComponent, DialogConfig } from '../../../../../shared/components/dialog/dialog';
import { ToastService } from '../../../../../core/services/toast-service';
import { PurchaseOrderService } from '../../../purchase-order/services/po-service';
import { PoItemResponse, ProductDropdown } from '../../../purchase-order/models/po-models';

@Component({
  selector: 'app-po-item-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, InputComponent, DialogComponent],
  templateUrl: './po-item-form.html',
})
export class PoItemForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(PurchaseOrderService);
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject(MatDialogRef<PoItemForm>);
  readonly data: {
    config: DialogConfig;
    poId: number;
    item?: PoItemResponse;
    products: ProductDropdown[];
  } = inject(MAT_DIALOG_DATA);

  readonly loading = signal(false);
  readonly isEdit = signal(false);
  readonly selectedProduct = signal<ProductDropdown | null>(null);

  form = this.fb.group({
    productId: [null as number | null, Validators.required],
    orderedQty: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  get products(): ProductDropdown[] {
    return this.data.products ?? [];
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl || !(ctrl.dirty || ctrl.touched)) return '';
    if (ctrl.hasError('required')) return field === 'productId' ? 'Product is required.' : 'Ordered quantity is required.';
    if (ctrl.hasError('min')) return 'Ordered quantity must be greater than zero.';
    return '';
  }

  ngOnInit(): void {
    if (this.data.item) {
      this.isEdit.set(true);
      const item = this.data.item;
      this.form.patchValue({
        productId: item.productId,
        orderedQty: item.orderedQty,
      });
      this.form.get('productId')?.disable();
    } else {
      this.form.get('productId')?.valueChanges.subscribe(id => {
        const product = this.products.find(p => p.id === id) ?? null;
        this.selectedProduct.set(product);
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const raw = this.form.getRawValue();

    const request$ = this.isEdit()
      ? this.svc.updateItem(this.data.poId, this.data.item!.id, { orderedQty: raw.orderedQty! })
      : this.svc.addItem(this.data.poId, { productId: raw.productId!, orderedQty: raw.orderedQty! });

    request$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.toast.success(this.isEdit() ? 'Item updated.' : 'Item added.');
          this.dialogRef.close(true);
        }
      }
    });
  }
}