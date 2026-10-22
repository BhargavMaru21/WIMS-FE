import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number; // ms
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 0;

  success(message: string, duration = 4000): void {
    this.add({ type: 'success', message, duration });
  }

  error(message: string, duration = 5000): void {
    this.add({ type: 'error', message, duration });
  }

  warning(message: string, duration = 4500): void {
    this.add({ type: 'warning', message, duration });
  }

  info(message: string, duration = 4000): void {
    this.add({ type: 'info', message, duration });
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private add(toast: Omit<Toast, 'id'>): void {
    const id = ++this.nextId;
    this.toasts.update((list) => [...list, { ...toast, id }]);

    // Auto-dismiss after duration
    setTimeout(() => this.dismiss(id), toast.duration);
  }
}