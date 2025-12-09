export interface SignupRequest {
//   full_name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
    id: BigInteger;
    email: string;
    is_active: boolean;
    is_staff: boolean;
    date_joined: string;
}
// export interface SignupResponse {
//   access: string;
//   refresh: string;
// }