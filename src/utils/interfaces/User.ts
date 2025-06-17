import { JwtPayload } from "jwt-decode";
import { IRole } from "./Role";

export interface ILoginInput {
  user_name: string;
  password: string;
}

export interface DecodedToken extends JwtPayload {
  id: string;
  username: string;
  access: boolean;
  currency: string;
  company: string;
  permissions: string[];
}

export interface IUser {
  _id: string;
  user_name: string;
  password: string;
  role: IRole;
  is_active: boolean;
  is_global: boolean;
}

export interface IUserInput {
  user_name: string;
  password: string;
  role: string;
  is_global: boolean;
}

export interface IChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
