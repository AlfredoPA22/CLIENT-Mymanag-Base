import { IProduct } from "./Product";
import { IProductSerial } from "./ProductSerial";
import { ISaleOrder } from "./SaleOrder";

export interface ISaleOrderDetail {
  _id: string;
  sale_order: ISaleOrder;
  product: IProduct;
  sale_price: number;
  quantity: number;
  serials: number;
  subtotal: number;
}

export interface ISaleOrderDetailInput {
  sale_order: string;
  product: string;
  sale_price: string;
  quantity: string;
  warehouse?: string;
}

export interface IAddSerialToSaleOrderDetailInput {
  sale_order_detail?: string;
  serial?: string;
}

export interface ISaleOrderDetailToPDF {
  saleOrderDetail: ISaleOrderDetail;
  productSerial: IProductSerial[];
}