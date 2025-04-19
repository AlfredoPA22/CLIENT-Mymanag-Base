import { IPurchaseOrderDetailToPDF } from "./PurchaseOrderDetail";
import { IProvider } from "./Provider";

export interface IPurchaseOrder {
  _id: string;
  code: string;
  provider: IProvider;
  date: Date;
  total: number;
  status: string;
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

export interface IFilterPurchaseOrderInput {
  startDate?: Date | null;
  endDate?: Date | null;
  provider?: string;
  status?: string;
}
