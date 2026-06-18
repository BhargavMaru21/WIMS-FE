import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderReview } from './purchase-order-review';

describe('PurchaseOrderReview', () => {
  let component: PurchaseOrderReview;
  let fixture: ComponentFixture<PurchaseOrderReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderReview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderReview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
