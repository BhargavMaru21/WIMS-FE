import {
  Component,
  ElementRef,
  HostListener,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NotificationItem {
  id: number;
  title: string;
  description: string;
  read?: boolean;
}

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-dropdown.html',
  styleUrl: './notification-dropdown.scss',
})
export class NotificationDropdownComponent {
  readonly notifications = input<NotificationItem[]>([]);
  readonly open = signal(false);

  get unreadCount(): number {
    return this.notifications().filter((n) => !n.read).length;
  }

  constructor(private readonly elRef: ElementRef) {}

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }
}