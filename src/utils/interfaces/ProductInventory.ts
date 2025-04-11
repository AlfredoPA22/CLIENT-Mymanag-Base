import { IProduct } from "./Product";
import { IPurchaseOrderDetail } from "./PurchaseOrderDetail";
import { ISaleOrderDetail } from "./SaleOrderDetail";

export interface IProductInventory {
  serial: string;
  product: IProduct;
  purchase_order_detail: IPurchaseOrderDetail;
  sale_order_detail: ISaleOrderDetail;
  status: string;
}
