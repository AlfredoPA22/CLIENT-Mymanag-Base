export interface IRole {
  _id: string;
  name: string;
  description: string;
  permission: string[];
}

export interface IRoleInput {
  name: string;
  description?: string;
  permission: string[];
}
