export type UserRole = 'doctor' | 'nurse' | 'admin' | 'superadmin' | 'receptionist';

export interface User {
  userid: string;
  password?: string;
  role: UserRole;
  name: string;
  posting: string;
  agents: string[];
}
