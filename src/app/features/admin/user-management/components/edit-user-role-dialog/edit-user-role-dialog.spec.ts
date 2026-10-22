import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserRoleDialog } from './edit-user-role-dialog';

describe('EditUserRoleDialog', () => {
  let component: EditUserRoleDialog;
  let fixture: ComponentFixture<EditUserRoleDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditUserRoleDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditUserRoleDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
