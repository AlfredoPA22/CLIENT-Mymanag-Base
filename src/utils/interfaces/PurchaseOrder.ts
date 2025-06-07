import { IProvider } from "./Provider";
import {
  IPurchaseOrderDetail,
  IPurchaseOrderDetailToPDF,
} from "./PurchaseOrderDetail";
import { IUser } from "./User";

export interface IPurchaseOrder {
  _id: string;
  code: string;
  provider: IProvider;
  date: Date;
  total: number;
  status: string;
  created_by: IUser;
}

export interface IPurchaseOrderInput {
  date: Date;
  provider: string;
}

export interface IPurchaseOrderToPDF {
  purchaseOrder: IPurchaseOrder;
  purchaseOrderDetail: IPurchaseOrderDetailToPDF[];
}

export interface IPurchaseOrderByYear {
  month: string;
  total: Number;
}

export interface IPurchaseOrderByProduct {
  purchaseOrder: IPurchaseOrder;
  purchaseOrderDetail: IPurchaseOrderDetail;
}

export interface IFilterPurchaseOrderInput {
  startDate?: Date | null;
  endDate?: Date | null;
  provider?: string;
  status?: string;
}
