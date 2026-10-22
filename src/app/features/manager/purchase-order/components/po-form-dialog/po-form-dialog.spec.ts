import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoFormDialog } from './po-form-dialog';

describe('PoFormDialog', () => {
  let component: PoFormDialog;
  let fixture: ComponentFixture<PoFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
