// types/registration.ts

export interface UserShort {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export type RegistrationStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'ATTENDED';

export interface Registration {
  id: string;
  user: UserShort;
  status: RegistrationStatus;
  appliedAt: string; // Date serialized từ backend (ISO string)
}

interface GetRegistrationsOptions {
  status?: string[];      // ["APPROVED","PENDING"] hoặc ["APPROVED"]
  countOnly?: boolean;    // true/false
  managerToken?: string;         // nếu cần xác thực
}