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
  exchange_rate?: number | null;
  payment_exchange_rate_source?: string | null;
  store_enabled: boolean;
  store_banner_image?: string;
  store_theme?: IStoreTheme;
  pos_sale_mode_enabled?: boolean;
  sale_pdf_footer_note?: string;
  sale_pdf_footer_image?: string;
  plan: string;
  status: string;
  trial_expires_at?: string | null;
  subscription_expires_at?: string | null;
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
  exchange_rate?: number | null;
  payment_exchange_rate_source?: string | null;
  store_enabled?: boolean;
  store_banner_image?: string;
  store_theme?: IStoreTheme;
  pos_sale_mode_enabled?: boolean;
  sale_pdf_footer_note?: string;
  sale_pdf_footer_image?: string;
}
