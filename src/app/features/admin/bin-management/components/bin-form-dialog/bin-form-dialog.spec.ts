import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BinFormDialog } from './bin-form-dialog';

describe('BinFormDialog', () => {
  let component: BinFormDialog;
  let fixture: ComponentFixture<BinFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BinFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BinFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
