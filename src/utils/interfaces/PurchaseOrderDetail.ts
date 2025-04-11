import { IProduct } from "./Product";
import { IProductSerial } from "./ProductSerial";
import { IPurchaseOrder } from "./PurchaseOrder";

export interface IPurchaseOrderDetail {
  _id: string;
  purchase_order: IPurchaseOrder;
  product: IProduct;
  purchase_price: number;
  quantity: number;
  serials: number;
  subtotal: number;
}

export interface IPurchaseOrderDetailInput {
  purchase_order: string;
  product: string;
  purchase_price: string;
  quantity: string;
  warehouse?: string;
}

export interface IAddSerialToPurchaseOrderDetailInput {
  purchase_order_detail: string;
  serial: string;
  warehouse: string;
}

export interface IPurchaseOrderDetailToPDF {
  purchaseOrderDetail: IPurchaseOrderDetail;
  productSerial: IProductSerial[];
}
