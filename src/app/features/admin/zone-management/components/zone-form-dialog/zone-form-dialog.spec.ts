import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneCreateDialog } from './zone-form-dialog';

describe('ZoneCreateDialog', () => {
  let component: ZoneCreateDialog;
  let fixture: ComponentFixture<ZoneCreateDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoneCreateDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZoneCreateDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
