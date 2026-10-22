import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
  readonly leaving = signal<Set<number>>(new Set());

  dismiss(toast: Toast): void {
    this.leaving.update((s) => new Set(s).add(toast.id));
    setTimeout(() => {
      this.toastService.dismiss(toast.id);
      this.leaving.update((s) => {
        const next = new Set(s);
        next.delete(toast.id);
        return next;
      });
    }, 220);
  }

  isLeaving(id: number): boolean {
    return this.leaving().has(id);
  }

  trackById(_: number, t: Toast): number {
    return t.id;
  }

  iconFor(type: Toast['type']): string {
    switch (type) {
      case 'success': return 'bi-check-circle-fill';
      case 'error': return 'bi-x-circle-fill';
      case 'warning': return 'bi-exclamation-triangle-fill';
      case 'info': return 'bi-info-circle-fill';
    }
  }

  labelFor(type: Toast['type']): string {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Info';
    }
  }
}