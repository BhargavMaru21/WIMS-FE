import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BinManagement } from './bin-management';

describe('BinManagement', () => {
  let component: BinManagement;
  let fixture: ComponentFixture<BinManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BinManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BinManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
