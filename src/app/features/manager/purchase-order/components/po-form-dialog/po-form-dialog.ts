import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter, MatOption } from '@angular/material/core';
import { finalize } from 'rxjs';
import { PurchaseOrderService } from '../../services/po-service';
import { PoCreateRequest, PoItemCreateRequest, PoResponse, ProductDropdown } from '../../models/po-models';
import { InputComponent } from '../../../../../shared/components/input/input';
import { DialogComponent, DialogConfig } from '../../../../../shared/components/dialog/dialog';
import { ToastService } from '../../../../../core/services/toast-service';
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { ProductService } from '../../../../admin/product-management/services/product-service';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


interface PoItemCreateDemoRequest {
  productId: number;
  orderedQty: number;
  lineTotal?: number
}

@Component({
  selector: 'app-po-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    InputComponent,
    DialogComponent,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule 
],
  providers: [provideNativeDateAdapter()],
  templateUrl: './po-form-dialog.html',
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
  productPrice = signal(0);
  qnt = signal(0);
  quantity =  new FormControl('')

  selectedItems: PoItemCreateDemoRequest[] = [
    { productId: 0, orderedQty: 1 } 
  ];

  minDate = new Date(Date.now() + 86400000); // tomorrow
  maxDate = new Date(2026, 11, 31); 

  form = this.fb.group({
    supplierName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200), Validators.pattern(/^[a-zA-Z\s]+$/)]],
    supplierContact: ['', [Validators.pattern(/^(?:\+91[\-\s]?)?[6-9]\d{9}$/)]],
    expectedDelivery: [null as Date | null, Validators.required],
    notes: ['', [Validators.maxLength(1000)]],
  });

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

  getProductPrice(id : number):number{
    let product = this.allProducts().find(x => x.id === id)
    return product?.unitPrice ?? 0;
  }

  getLineTotal(item : PoItemCreateRequest) : number{
    return this.getProductPrice(item.productId) * item.orderedQty
  }

  getGrandTotal(){
    return this.selectedItems.reduce((sum,item) => sum + this.getLineTotal(item) , 0)
  }
  onSelectChange(value:number){
    let product = this.allProducts().find(x => x.id === value)
    this.productPrice.set(product!.unitPrice)
  }

  AddNewRow(){
    this.selectedItems.push({ productId: 0, orderedQty: 1 });
  }

  DeleteRow(index: number){
    console.log(index);
    if(this.selectedItems.length == 1 ) 
        return this.toast.error("At Least One Item required") 
    this.selectedItems.splice(index, 1);
  }


  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const validSelections = this.selectedItems.filter(item => item.productId !== 0);
    if(validSelections.length == 0)
        return this.toast.error("At least one product item need to select");

    this.loading.set(true);
    const raw = this.form.getRawValue();
    
    const expectedDelivery = this.toDateOnlyString(raw.expectedDelivery!);

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
        itemList : validSelections
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