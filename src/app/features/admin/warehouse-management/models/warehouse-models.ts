import { DialogConfig } from "../../../../shared/components/dialog/dialog";

//Warehouse
export interface WarehouseResponse {
  id: number;
  code: string;
  name: string;
  address: string;
  city: string;
  contactPerson: string;
  contactPhone: string;
  status: string;
}

export interface WarehouseCreateRequest {
  name: string;
  address: string;
  city: string;
  contactPerson: string;
  contactPhone: string;
}

export interface WarehouseUpdateRequest {
  name?: string;
  address?: string;
  city?: string;
  contactPerson?: string;
  contactPhone?: string;
}


//Zone
export interface ZoneResponse {
  id: number;
  code: string;
  name: string;
  warehouseId: number;
  warehouseName: string;
  status: string;
}

export interface ZoneCreateRequest {
  warehouseId: number;
  name: string;
}

export interface ZoneUpdateRequest {
  name?: string;
}

export interface EditZoneDialogData{
  config : DialogConfig,
  zone : ZoneResponse
  warehouseOptions : WarehouseDropdown[]
}

export interface EditBinDialogData {
  config: DialogConfig;
  bin?: BinResponse;
  warehouses: WarehouseDropdown[];
  zones: ZoneDropdown[];
}

//Bin
export interface BinResponse {
  id: number;
  code: string;
  name: string;
  zoneId: number;
  zoneName: string;
  warehouseId: number;
  warehouseName: string;
  maxCapacity: number;
  status: string;
}

export interface BinCreateRequest {
  zoneId: number;
  name: string;
  maxCapacity: number;
}

export interface BinUpdateRequest {
  name?: string;
  maxCapacity?: number;
}

export interface WarehouseDropdown {
  id:number;
  name: string
}


export interface ZoneDropdown {
  id: number;
  code: string;
  name: string;
  warehouseId: number;
}

export interface StatusUpdateRequest {
  status: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
}

export interface QueryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection: string;
  [key: string]: string | number | undefined;
}