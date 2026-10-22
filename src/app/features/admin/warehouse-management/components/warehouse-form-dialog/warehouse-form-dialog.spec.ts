import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseFormDialog } from './warehouse-form-dialog';

describe('WarehouseFormDialog', () => {
  let component: WarehouseFormDialog;
  let fixture: ComponentFixture<WarehouseFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehouseFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
