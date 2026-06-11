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
import { ProductService } from '../../services/product-service';
import { ProductFormDialogData, UomResponse } from '../../models/product-models';
import { ProductCategoryDropdownResponse } from '../../../product-category/models/product-category-models';

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, InputComponent, DialogComponent],
  templateUrl: './product-form-dialog.html',
})
export class ProductFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProductService);
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject(MatDialogRef<ProductFormDialog>);
  readonly data: ProductFormDialogData = inject(MAT_DIALOG_DATA);

  loading = signal(false);
  isEdit = signal(false);

  form = this.fb.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(200),
      Validators.pattern(/^(?=.*[A-Za-z])[A-Za-z0-9\s\-_&()./]+$/),
    ]],
    description: ['', [Validators.maxLength(1000)]],
    categoryId: [null as number | null, Validators.required],
    uomId: [null as number | null, Validators.required],
    unitPrice: [null as number | null, [Validators.required, Validators.min(0.01)]],
    reorderLevel: [0, [Validators.required, Validators.min(0)]],
  });

  get categories(): ProductCategoryDropdownResponse[] {
    return this.data.categories ?? [];
  }

  get uoms(): UomResponse[] {
    return this.data.uoms ?? [];
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl || !(ctrl.dirty || ctrl.touched)) return '';

    const labels: Record<string, string> = {
      name: 'Product name',
      unitPrice: 'Unit price',
      reorderLevel: 'Reorder level',
    };

    const label = labels[field] ?? field;

    if (ctrl.hasError('required')) return `${label} is required.`;
    if (ctrl.hasError('minlength')) return `${label} must be at least 2 characters.`;
    if (ctrl.hasError('maxlength')) return field === 'name'
      ? 'Product name must not exceed 200 characters.'
      : 'Description must not exceed 1000 characters.';
    if (ctrl.hasError('pattern')) return 'Product name allows letters, numbers, spaces, hyphens, underscores and parentheses (must include a letter).';
    if (ctrl.hasError('min')) return field === 'unitPrice'
      ? 'Unit price must be greater than zero.'
      : 'Reorder level cannot be negative.';
    return '';
  }

  ngOnInit(): void {
    if (this.data.product) {
      this.isEdit.set(true);
      const p = this.data.product;
      this.form.patchValue({
        name: p.name,
        description : p.description,
        categoryId: p.categoryId,
        uomId: p.uomId,
        unitPrice: p.unitPrice,
        reorderLevel: p.reorderLevel,
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
      ? this.service.updateProduct(this.data.product!.id, {
          name: raw.name!,
          description: raw.description ?? null,
          categoryId: raw.categoryId!,
          uomId: raw.uomId!,
          unitPrice: raw.unitPrice!,
          reorderLevel: raw.reorderLevel!,
        })
      : this.service.createProduct({
          name: raw.name!,
          description: raw.description ?? null,
          categoryId: raw.categoryId!,
          uomId: raw.uomId!,
          unitPrice: raw.unitPrice!,
          reorderLevel: raw.reorderLevel!,
        });

    request$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.toast.success(this.isEdit() ? 'Product updated.' : 'Product created.');
          this.dialogRef.close(true);
        } else {
          this.toast.error(res.message ?? 'Something went wrong.');
        }
      },
    });
  }
}