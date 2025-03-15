export interface IBrand {
  _id: string;
  name: string;
  description: string;
  count_product: number;
  is_active: boolean;
}

export interface IBrandInput {
  name?: string;
  description: string;
}
