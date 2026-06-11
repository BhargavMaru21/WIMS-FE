import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { DialogComponent, DialogConfig } from '../../../../../shared/components/dialog/dialog';
import { ProductService } from '../../services/product-service';
import { ProductResponse } from '../../models/product-models';

@Component({
  selector: 'app-product-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, DialogComponent],
  templateUrl: './product-detail-dialog.html',
  styleUrl: './product-detail-dialog.scss',
})
export class ProductDetailDialog implements OnInit {
  private readonly service = inject(ProductService);
  readonly data: { config: DialogConfig; productId: number } = inject(MAT_DIALOG_DATA);

  loading = signal(false);
  product = signal<ProductResponse | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    this.service.getProductById(this.data.productId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => {
          if (res.isSuccess && res.data) {
            this.product.set(res.data);
          }
        }
      });
  }
}