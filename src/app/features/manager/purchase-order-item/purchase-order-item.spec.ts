import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderItem } from './purchase-order-item';

describe('PurchaseOrderItem', () => {
  let component: PurchaseOrderItem;
  let fixture: ComponentFixture<PurchaseOrderItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
