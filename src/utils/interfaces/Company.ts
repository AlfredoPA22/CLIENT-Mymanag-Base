export interface ICompany {
  _id: string;
  name: string;
  legal_name: string;
  nit: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  image: string;
  currency: string;
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
}
