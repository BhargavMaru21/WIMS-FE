import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserWarehouseDialog } from './edit-user-warehouse-dialog';

describe('EditUserWarehouseDialog', () => {
  let component: EditUserWarehouseDialog;
  let fixture: ComponentFixture<EditUserWarehouseDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditUserWarehouseDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditUserWarehouseDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
