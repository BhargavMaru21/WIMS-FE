import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../../shared/components/input/input';
import { DialogComponent, DialogConfig } from '../../../../../shared/components/dialog/dialog';
import { ToastService } from '../../../../../core/services/toast-service';
import { ProductCategoryService } from '../../services/product-category-service';
import { ProductCategoryResponse } from '../../models/product-category-models';

@Component({
  selector: 'app-product-category-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, DialogComponent],
  templateUrl: './product-category-form-dialog.html',
})
export class ProductCategoryFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProductCategoryService);
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject(MatDialogRef<ProductCategoryFormDialog>);
  readonly data: { config: DialogConfig; category?: ProductCategoryResponse } = inject(MAT_DIALOG_DATA);

  readonly loading = signal(false);
  readonly isEdit = signal(false);

  form = this.fb.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
      Validators.pattern(/^(?=.*[A-Za-z])[A-Za-z\s\-_()]+$/),
    ]],
    description: ['', [Validators.maxLength(500)]],
  });

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl || !(ctrl.dirty || ctrl.touched)) return '';
    if (ctrl.hasError('required')) return 'Category Name is required';
    if (ctrl.hasError('minlength')) return 'Category name must be at least 2 characters.';
    if (ctrl.hasError('maxlength')) return field === 'name'
      ? 'Category name must not exceed 100 characters.'
      : 'Description must not exceed 500 characters.';
    if (ctrl.hasError('pattern')) return 'Category name allows letters, spaces, hyphens, underscores and parentheses (must include a letter).';
    return '';
  }

  ngOnInit(): void {
    if (this.data.category) {
      this.isEdit.set(true);
      this.form.patchValue({
        name: this.data.category.name,
        description: this.data.category.description ?? '',
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

    const payload = {
      name: raw.name!,
      description: raw.description || undefined,
    };

    const request$ = this.isEdit()
      ? this.service.updateProductCategory(this.data.category!.id, payload)
      : this.service.createProductCategory(payload);

    request$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.toast.success(this.isEdit() ? 'Category updated.' : 'Category created.');
          this.dialogRef.close(true);
        } else {
          this.toast.error(res.message ?? 'Something went wrong.');
        }
      },
    });
  }
}