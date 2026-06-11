import { DialogConfig } from '../../../../shared/components/dialog/dialog';
import { ProductCategoryDropdownResponse } from '../../product-category/models/product-category-models';

export interface ProductResponse {
  id: number;
  sku: string;
  name: string;
  description?: string;
  categoryId: number;
  categoryName: string;
  uomId: number;
  uomName: string;
  uomAbbreviation: string;
  unitPrice: number;
  reorderLevel: number;
  status: string;
}

export interface ProductCreateRequest {
  name: string;
  description?: string |null;
  categoryId: number;
  uomId: number;
  unitPrice: number;
  reorderLevel: number;
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string | null;
  categoryId?: number;
  uomId?: number;
  unitPrice?: number;
  reorderLevel?: number;
}

export interface ProductStatusUpdateRequest {
  status: string;
}

export interface UomResponse {
  id: number;
  name: string;
  abbreviation: string;
}

export type UomDialogMode = 'list' | 'add' | 'edit';

export interface ProductFormDialogData {
  config: DialogConfig;
  product?: ProductResponse;
  categories: ProductCategoryDropdownResponse[];
  uoms: UomResponse[];
}