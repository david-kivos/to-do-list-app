import { UUID } from "crypto";

export interface SignupRequest {
//   full_name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
    id: number;
    email: string;
    is_active: boolean | undefined;
    is_staff: boolean | undefined;
    date_joined: string;
}
// export interface SignupResponse {
//   access: string;
//   refresh: string;
// }