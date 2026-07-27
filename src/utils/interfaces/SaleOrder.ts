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
  contado_payment_method?: string;
  created_by: IUser;
  is_paid: boolean;
  has_return?: boolean;
  discount_type?: string | null;
  discount_value?: number;
  discount_amount?: number;
  source?: string;
}

export interface ISaleOrderInput {
  date: Date;
  client: string;
  payment_method: string;
  contado_payment_method?: string;
}

export interface IQrPaymentInfo {
  amount: number;
  currency: string;
  amount_bob?: number;
  exchange_rate?: number;
}

export interface ISaleOrderToPDF {
  saleOrder: ISaleOrder;
  saleOrderDetail: ISaleOrderDetailToPDF[];
  qr_payment_info?: IQrPaymentInfo | null;
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

export interface IStoreOrderStatsProduct {
  product: string;
  quantity: number;
  total: number;
}

export interface IStoreOrderStats {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  totalRevenue: number;
  averageTicket: number;
  topProducts: IStoreOrderStatsProduct[];
}
