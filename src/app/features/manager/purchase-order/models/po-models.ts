export interface PoItemResponse {
    id: number;
    productId: number;
    productName: string;
    orderedQty: number;
    unitPrice: number;
    receivedQty: number;
    lineTotal: number
}

export interface PoResponse {
    id: number;
    poNumber: string;
    supplierName: string;
    supplierContact?: string;
    warehouseId: number;
    warehouseName: string;
    orderDate?: string;
    expectedDelivery: string;
    status: string;
    totalAmount: number;
    notes?: string;

    submittedBy?: number;
    submittedByName?: string;
    submittedAt?: string;

    approvedBy?: number;
    approvedByName?: string;
    approvedAt?: string;

    rejectedBy?: number;
    rejectedByName?: string;
    rejectedAt?: string;
    rejectionReason?: string;

    cancelledBy?: number;
    cancelledByName?: string;
    cancelledAt?: string;

    createdBy: number;
    createdAt: string;

    canApprove: boolean;
    canEdit: boolean;

    items: PoItemResponse[];
}

export interface PoCreateRequest {
    supplierName: string;
    supplierContact?: string;
    expectedDelivery: string;
    notes?: string;
}

export interface PoUpdateRequest {
    supplierName?: string;
    supplierContact?: string;
    expectedDelivery?: string;
    notes?: string;
}

export type PoStatus = "Submitted" | "Approved" | "Rejected" | "Cancelled"

export const PO_STATUS = {
    'submit': "Submitted",
    'approve': 'Approved',
    'reject': 'Rejected',
    'cancel': 'Cancelled'
}

export interface PoStatusUpdateRequest {
    status: PoStatus;
    rejectionReason?: string;
}

export interface PoItemCreateRequest {
    productId: number;
    orderedQty: number;
}

export interface PoItemUpdateRequest {
    orderedQty?: number;
}

export interface ProductDropdown {
    id: number;
    name: string;
    unitPrice: number;
}
