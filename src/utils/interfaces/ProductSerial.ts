import { IProduct } from "./Product";
import { IPurchaseOrderDetail } from "./PurchaseOrderDetail";
import { ISaleOrderDetail } from "./SaleOrderDetail";
import { IWarehouse } from "./Warehouse";

export interface IProductSerial {
  _id: string;
  serial: string;
  product: IProduct;
  warehouse: IWarehouse;
  purchase_order_detail: IPurchaseOrderDetail;
  sale_order_detail: ISaleOrderDetail;
  status: string;
}
