export interface IProductInventory {
  _id: string;
  warehouse: { _id: string; name: string };
  purchase_order_detail: {
    _id: string;
    purchase_order: { _id: string; code: string; status: string };
  };
  quantity: number;
  available: number;
  reserved: number;
  sold: number;
  transferred: number;
  status: string;
}
