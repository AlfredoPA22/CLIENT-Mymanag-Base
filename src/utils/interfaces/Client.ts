export interface IClient {
  _id: string;
  code: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface IClientInput {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}
