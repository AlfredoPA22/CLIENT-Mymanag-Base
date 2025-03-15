import { stockType } from "../enums/stockType.enum";
import { IBrand } from "./Brand";
import { ICategory } from "./Category";

export interface IProduct {
  _id: string;
  code: string;
  description: string;
  last_cost_price: number;
  name: string;
  sale_price: number;
  status: string;
  stock: number;
  category: ICategory;
  brand: IBrand;
  fullName: string;
  stock_type: stockType;
}

export interface IProductInput {
  name: string;
  code?: string;
  description?: string;
  sale_price?: string;
  category: string;
  brand: string;
  stock_type: stockType;
}
