import { ISaleOrder } from "./SaleOrder";
import { IUser } from "./User";

export interface ICommission {
  _id: string;
  // null cuando la venta que la generó fue eliminada — la comisión se anula
  // pero se conserva el registro (ver voidCommissionForSaleOrder).
  sale_order: ISaleOrder | null;
  seller: IUser;
  rate: number;
  amount: number;
  status: string;
  paid_at?: string | null;
  paid_by?: IUser | null;
  createdAt: string;
}

export interface ICommissionFilterInput {
  sellerId?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  status?: string;
}
