export interface IPermission {
  label: string;
  name: string;
  value: string;
  children: IPermission[];
}

export interface TreeNodeInterface {
  key: string;
  label: string;
  data: string;
  children: TreeNodeInterface[];
}
