export interface IWarehouse {
  _id: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface IWarehouseInput {
  name: string;
  description?: string;
}
