import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseFormDialogComponent } from './warehouse-form-dialog';

describe('WarehouseFormDialogComponent', () => {
  let component: WarehouseFormDialogComponent;
  let fixture: ComponentFixture<WarehouseFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehouseFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
