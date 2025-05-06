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
