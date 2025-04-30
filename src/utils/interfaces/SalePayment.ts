import { ISaleOrder } from "./SaleOrder";
import { IUser } from "./User";

export interface ISalePaymentInput {
  sale_order: string;
  date: Date;
  amount: number;
  payment_method: string;
  note?: string;
}

export interface ISalePayment {
  _id: string;
  amount: number;
  created_by: IUser;
  date: Date;
  note: string;
  payment_method: string;
  sale_order: ISaleOrder;
}

export interface IDetailSalePayment {
  sale_order: ISaleOrder;
  total_amount: number;
  total_paid: number;
  total_pending: number;
}
