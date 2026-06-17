import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoItemForm } from './po-item-form';

describe('PoItemForm', () => {
  let component: PoItemForm;
  let fixture: ComponentFixture<PoItemForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoItemForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoItemForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
