import { IPermission } from "./Permission";

export interface IRole {
  _id: string;
  name: string;
  description: string;
  permission: IPermission[];
}

export interface IRoleInput {
  name: string;
  description?: string;
  permission: string[];
}

