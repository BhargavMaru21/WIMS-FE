import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecetPassword } from './reset-password';

describe('RecetPassword', () => {
  let component: RecetPassword;
  let fixture: ComponentFixture<RecetPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecetPassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecetPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
