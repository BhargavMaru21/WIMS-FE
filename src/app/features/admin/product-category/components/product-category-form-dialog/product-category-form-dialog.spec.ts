import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCategoryFormDialog } from './product-category-form-dialog';

describe('ProductCategoryFormDialog', () => {
  let component: ProductCategoryFormDialog;
  let fixture: ComponentFixture<ProductCategoryFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCategoryFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCategoryFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
