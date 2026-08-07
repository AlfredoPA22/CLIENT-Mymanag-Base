import { ISaleOrder } from "./SaleOrder";
import { IUser } from "./User";

export interface ISalePaymentInput {
  sale_order: string;
  date: Date;
  amount: number;
  payment_method: string;
  note?: string;
  currency?: string;
}

export interface ISalePayment {
  _id: string;
  amount: number;
  created_by: IUser;
  date: Date;
  note: string;
  payment_method: string;
  sale_order: ISaleOrder;
  currency?: string | null;
  exchange_rate?: number | null;
}

export interface IDetailSalePayment {
  sale_order: ISaleOrder;
  total_amount: number;
  total_paid: number;
  total_pending: number;
}
