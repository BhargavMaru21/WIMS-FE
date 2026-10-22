import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseManagement } from './warehouse-management';

describe('WarehouseManagement', () => {
  let component: WarehouseManagement;
  let fixture: ComponentFixture<WarehouseManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehouseManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
