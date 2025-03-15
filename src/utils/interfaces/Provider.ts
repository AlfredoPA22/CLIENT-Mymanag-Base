export interface IProvider {
  _id: string;
  code: string;
  name: string;
  address: string;
  phoneNumber: string;
}

export interface IProviderInput {
  name: string;
  address?: string;
  phoneNumber?: string;
}
