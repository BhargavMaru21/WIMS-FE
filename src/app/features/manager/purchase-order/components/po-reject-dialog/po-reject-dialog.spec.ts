import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoRejectDialog } from './po-reject-dialog';

describe('PoRejectDialog', () => {
  let component: PoRejectDialog;
  let fixture: ComponentFixture<PoRejectDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoRejectDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoRejectDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
