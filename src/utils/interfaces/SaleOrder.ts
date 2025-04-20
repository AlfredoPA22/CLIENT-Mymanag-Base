import { IClient } from "./Client";
import { ISaleOrderDetailToPDF } from "./SaleOrderDetail";
import { IUser } from "./User";

export interface ISaleOrder {
  _id: string;
  code: string;
  client: IClient;
  date: Date;
  total: number;
  status: string;
  created_by: IUser;
}

export interface ISaleOrderInput {
  date: Date;
  client: string;
}

export interface ISaleOrderToPDF {
  saleOrder: ISaleOrder;
  saleOrderDetail: ISaleOrderDetailToPDF[];
}

export interface ISaleOrderByYear {
  month: string;
  total: Number;
}

export interface IFilterSaleOrderInput {
  startDate?: Date | null;
  endDate?: Date | null;
  client?: string;
  status?: string;
}
