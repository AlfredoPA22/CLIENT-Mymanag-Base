import { IProduct } from "./Product";
import { IUser } from "./User";
import { IWarehouse } from "./Warehouse";

export interface IProductTransferInput {
  date: Date;
  origin_warehouse: string;
  destination_warehouse: string;
}

export interface IProductTransfer {
  _id: string;
  code: string;
  origin_warehouse: IWarehouse;
  destination_warehouse: IWarehouse;
  date: Date;
  status: string;
  created_by: IUser;
}

export interface IProductTransferDetailInput {
  product_transfer: string;
  product: string;
  quantity: number | string;
}

export interface IProductTransferDetail {
  _id: string;
  quantity: number;
  serials: string[];
  // null si el producto fue eliminado (referencia huérfana) — el backend
  // ahora bloquea borrar un producto mientras exista un ProductTransferDetail
  // apuntándolo, pero datos viejos podrían seguir teniendo esto en null.
  product: Pick<IProduct, "_id" | "code" | "name" | "stock_type" | "stock"> | null;
}

export interface IAddSerialToTransferDetailInput {
  product_transfer_detail: string;
  serial: string;
}
