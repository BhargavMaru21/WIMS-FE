import {
  Component,
  inject,
  input,
  output,
  TemplateRef,
  contentChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface DialogConfig {
  title: string;
  submitLabel?: string;    
  cancelLabel?: string;    
  submitColor?: 'primary' | 'danger'; 
  hideFooter?: boolean; 
  width?: string;
}

export interface DialogData {
  config: DialogConfig;
}

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class DialogComponent {
  readonly loading = input<boolean>(false);
  readonly submitDisabled = input<boolean>(false);
  readonly submitted = output<void>();

  readonly data: DialogData = inject(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DialogComponent>);

  get config(): DialogConfig {
    return this.data?.config ?? { title: '' };
  }

  get submitLabel(): string {
    return this.config.submitLabel ?? 'Save';
  }

  get cancelLabel(): string {
    return this.config.cancelLabel ?? 'Cancel';
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.submitted.emit();
  }
}