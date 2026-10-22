import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockKeeperLayout } from './stock-keeper-layout';

describe('StockKeeperLayout', () => {
  let component: StockKeeperLayout;
  let fixture: ComponentFixture<StockKeeperLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockKeeperLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockKeeperLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
