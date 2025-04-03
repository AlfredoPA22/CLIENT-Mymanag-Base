export interface IClient {
  _id: string;
  code: string;
  fullName: string;
  email: string;
  address: string;
  phoneNumber: string;
}

export interface IClientInput {
  fullName: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
}
