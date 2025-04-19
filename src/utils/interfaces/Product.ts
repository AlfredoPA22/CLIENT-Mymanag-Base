import { stockType } from "../enums/stockType.enum";
import { IBrand } from "./Brand";
import { ICategory } from "./Category";

export interface IProduct {
  _id: string;
  code: string;
  description: string;
  image: string;
  last_cost_price: number;
  name: string;
  sale_price: number;
  status: string;
  stock: number;
  category: ICategory;
  brand: IBrand;
  stock_type: stockType;
}

export interface IProductInput {
  name: string;
  code?: string;
  description?: string;
  image?: string;
  sale_price?: string;
  category: string;
  brand: string;
  stock_type: stockType;
}

export interface IFilterProductInput {
  category?: string;
  brand?: string;
  status?: string;
}

export interface ISearchProductInput {
  serial: string;
}
