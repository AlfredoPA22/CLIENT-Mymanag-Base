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
  companyLogo?: string;
  permissions: string[];
  is_global: boolean;
}

export interface IUser {
  _id: string;
  user_name: string;
  password: string;
  // null si el rol asignado fue eliminado (referencia huérfana) — el backend
  // ahora valida el rol al crear/editar un usuario, pero datos viejos podrían
  // seguir teniendo esto en null.
  role: IRole | null;
  is_active: boolean;
  is_global: boolean;
  commission_rate?: number | null;
}

export interface IUserInput {
  user_name: string;
  password: string;
  role: string;
  is_global: boolean;
  commission_rate?: number | null;
}

export interface IChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
