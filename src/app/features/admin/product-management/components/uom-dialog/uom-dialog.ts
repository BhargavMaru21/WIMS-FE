import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../../shared/components/input/input';
import { DialogComponent, DialogConfig } from '../../../../../shared/components/dialog/dialog';
import { ConfirmDialog } from '../../../../../shared/components/confirm-dialog/confirm-dialog';
import { ToastService } from '../../../../../core/services/toast-service';
import { ProductService } from '../../services/product-service';
import { UomDialogMode, UomResponse } from '../../models/product-models';

@Component({
  selector: 'app-uom-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    InputComponent,
    DialogComponent,
  ],
  templateUrl: './uom-dialog.html',
  styleUrl: './uom-dialog.scss',
})
export class UomDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProductService);
  private readonly toast = inject(ToastService);
  private readonly matDialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<UomDialog>);
  readonly data: { config: DialogConfig } = inject(MAT_DIALOG_DATA);

  loading = signal(false);
  submitting = signal(false);
  mode = signal<UomDialogMode>('list');
  editingUom = signal<UomResponse | null>(null);

  displayedColumns = ['name', 'abbreviation', 'actions'];
  dataSource = new MatTableDataSource<UomResponse>();

  form = this.fb.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
      Validators.pattern(/^(?=.*[A-Za-z])[a-zA-Z ]+$/),
    ]],
    abbreviation: ['', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(20),
      Validators.pattern(/^[a-zA-Z]+$/),
    ]],
  });

  get isFormMode(): boolean {
    return this.mode() === 'add' || this.mode() === 'edit';
  }

  get formTitle(): string {
    return this.mode() === 'edit' ? 'Edit Unit' : 'Add New Unit';
  }

  get submitLabel(): string {
    return this.mode() === 'edit' ? 'Update' : 'Add'
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl || !(ctrl.dirty || ctrl.touched)) return '';
    const label = field === 'name' ? 'Unit name' : 'Abbreviation';
    if (ctrl.hasError('required')) return `${label} is required.`;
    if (ctrl.hasError('minlength')) return `${label} must be at least ${field === 'name' ? 2 : 1} character.`;
    if (ctrl.hasError('maxlength')) return field === 'name'
      ? 'Unit name must not exceed 50 characters.'
      : 'Abbreviation must not exceed 20 characters.';
    if (ctrl.hasError('pattern')) return field === 'name'
      ? 'Unit name can only contain letters and spaces.'
      : 'Abbreviation can only contain letters.';
    return '';
  }

  ngOnInit(): void {
    this.loadUoms();
  }

  loadUoms(): void {
    this.loading.set(true);
    this.service.getAllUoms().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: res => {
        if (res.isSuccess && res.data) {
          this.dataSource.data = res.data;
        }
      }
    });
  }

  goToAdd(): void {
    this.form.reset();
    this.editingUom.set(null);
    this.mode.set('add');
  }

  goToEdit(uom: UomResponse): void {
    this.editingUom.set(uom);
    this.form.patchValue({ name: uom.name, abbreviation: uom.abbreviation });
    this.mode.set('edit');
  }

  goToList(): void {
    this.form.reset();
    this.editingUom.set(null);
    this.mode.set('list');
  }

  onDelete(uom: UomResponse): void {
    this.matDialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Delete Unit',
        message: `Are you sure you want to delete "${uom.name}"?`,
        confirmText: 'Delete',
      }
    }).afterClosed().subscribe(confirm => {
      if (!confirm) return;
      this.service.deleteUom(uom.id).subscribe({
        next: res => {
          if (res.isSuccess) {
            this.toast.success(res.data ?? 'Unit deleted.');
            this.loadUoms();
          } else {
            this.toast.error(res.message ?? 'Failed to delete unit.');
          }
        }
      });
    });
  }

  onClose() {
    this.dialogRef.close(false)
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const raw = this.form.getRawValue();
    const payload = { name: raw.name!, abbreviation: raw.abbreviation! };

    const request$ = this.mode() === 'edit'
      ? this.service.updateUom(this.editingUom()!.id, payload)
      : this.service.createUom(payload);

    request$.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.toast.success(this.mode() === 'edit' ? 'Unit updated.' : 'Unit added.');
          this.goToList();
          this.loadUoms();
        } else {
          this.toast.error(res.message ?? 'Something went wrong.');
        }
      }
    });
  }
}