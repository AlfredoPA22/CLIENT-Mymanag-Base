import { IClient } from "./Client";
import { ISaleOrderDetail, ISaleOrderDetailToPDF } from "./SaleOrderDetail";
import { IUser } from "./User";

export interface ISaleOrder {
  _id: string;
  code: string;
  client: IClient;
  date: Date;
  total: number;
  status: string;
  payment_method: string;
  created_by: IUser;
  is_paid: boolean;
}

export interface ISaleOrderInput {
  date: Date;
  client: string;
  payment_method: string;
}

export interface ISaleOrderToPDF {
  saleOrder: ISaleOrder;
  saleOrderDetail: ISaleOrderDetailToPDF[];
}

export interface ISaleOrderByYear {
  month: string;
  total: Number;
}

export interface ISaleOrderByProduct {
  saleOrder: ISaleOrder;
  saleOrderDetail: ISaleOrderDetail;
}

export interface IFilterSaleOrderInput {
  startDate?: Date | null;
  endDate?: Date | null;
  client?: string;
  status?: string;
}
