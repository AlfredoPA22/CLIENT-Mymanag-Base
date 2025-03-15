import { JwtPayload } from "jwt-decode";

export interface ILoginInput {
  user_name: string;
  password: string;
}

export interface DecodedToken extends JwtPayload {
  id: string;
  username: string;
  access: boolean;
}
