import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UomDialog } from './uom-dialog';

describe('UomDialog', () => {
  let component: UomDialog;
  let fixture: ComponentFixture<UomDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UomDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UomDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
