import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockKeeperLayoutComponent } from './stock-keeper-layout';

describe('StockKeeperLayoutComponent', () => {
  let component: StockKeeperLayoutComponent;
  let fixture: ComponentFixture<StockKeeperLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockKeeperLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockKeeperLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
