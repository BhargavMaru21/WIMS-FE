import {
  Component,
  ContentChild,
  ElementRef,
  HostListener,
  input,
  signal,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownItem {
  label: string;
  icon?: string;         
  danger?: boolean;      
  dividerBefore?: boolean;
  action: () => void;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
})
export class DropdownComponent {
  readonly title = input<string>('');

  readonly items = input<DropdownItem[]>([]);

  readonly align = input<'left' | 'right'>('right');

  readonly open = signal(false);

  @ContentChild('trigger', { read: TemplateRef }) triggerTpl?: TemplateRef<unknown>;

  constructor(private readonly elRef: ElementRef) {}

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }

  runAction(item: DropdownItem): void {
    this.close();
    item.action();
  }

  // Close when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }
}