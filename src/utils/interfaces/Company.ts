import { IStoreTheme } from "../storeTheme";

export interface ICompany {
  _id: string;
  name: string;
  slug: string;
  legal_name: string;
  nit: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  image: string;
  currency: string;
  store_enabled: boolean;
  store_banner_image?: string;
  store_theme?: IStoreTheme;
  plan: string;
  status: string;
}

export interface ICompanyInput {
  legal_name?: string;
  nit?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  image?: string;
  currency?: string;
  store_enabled?: boolean;
  store_banner_image?: string;
  store_theme?: IStoreTheme;
}
