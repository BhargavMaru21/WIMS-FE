import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface InboundReceiptItem {
  id: number;
  poNumber: string;
  supplierName: string;
  expectedDelivery: string;
  itemCount: number;
  status: 'Pending' | 'Inspecting' | 'Stored' | 'Put Away';
  dockBay: string;
  assignedBin?: string;
}

@Component({
  selector: 'app-goods-receipt',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './goods-receipt.html',
  styleUrl: './goods-receipt.scss',
})
export class GoodsReceipt {
  readonly searchQuery = signal('');
  readonly statusFilter = signal('All');
  readonly loading = signal(false);

  readonly shipments = signal<InboundReceiptItem[]>([
    {
      id: 101,
      poNumber: 'PO-2026-0042',
      supplierName: 'Alpha Logistics & Steel',
      expectedDelivery: 'Nov 03, 2026',
      itemCount: 48,
      status: 'Pending',
      dockBay: 'Bay-01',
    },
    {
      id: 102,
      poNumber: 'PO-2026-0044',
      supplierName: 'OmniPack Global Corp',
      expectedDelivery: 'Nov 03, 2026',
      itemCount: 120,
      status: 'Inspecting',
      dockBay: 'Bay-03',
      assignedBin: 'BIN-A1-04',
    },
    {
      id: 103,
      poNumber: 'PO-2026-0039',
      supplierName: 'Precision Tools Ltd',
      expectedDelivery: 'Nov 02, 2026',
      itemCount: 15,
      status: 'Stored',
      dockBay: 'Bay-02',
      assignedBin: 'BIN-B2-11',
    },
    {
      id: 104,
      poNumber: 'PO-2026-0035',
      supplierName: 'Apex Raw Materials Inc',
      expectedDelivery: 'Nov 01, 2026',
      itemCount: 350,
      status: 'Put Away',
      dockBay: 'Bay-04',
      assignedBin: 'BIN-C1-09',
    },
  ]);

  get filteredShipments(): InboundReceiptItem[] {
    const q = this.searchQuery().toLowerCase().trim();
    const sf = this.statusFilter();

    return this.shipments().filter((item) => {
      const matchesSearch =
        !q ||
        item.poNumber.toLowerCase().includes(q) ||
        item.supplierName.toLowerCase().includes(q) ||
        item.dockBay.toLowerCase().includes(q);

      const matchesStatus = sf === 'All' || item.status === sf;

      return matchesSearch && matchesStatus;
    });
  }

  setStatus(item: InboundReceiptItem, newStatus: InboundReceiptItem['status']): void {
    this.shipments.update((list) =>
      list.map((s) => (s.id === item.id ? { ...s, status: newStatus } : s)),
    );
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('All');
  }
}
