import { ReactNode } from 'react';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RawPermission {
  [module: string]: {
    view: boolean;
    edit: boolean;
    create: boolean;
    delete: boolean;
  };
}

export interface PermissionActions {
  view: boolean;
  edit: boolean;
  create: boolean;
  delete: boolean;
}

export type NormalizedPermissions = Record<string, PermissionActions>;

export interface RawModule {
  [key: string]: string;
}

export type NormalizedModules = Record<string, string>;

export interface LoginResponse {
  access_token: string;
  token_type: string;
  permissions: RawPermission[];
}

export interface ModulesResponse {
  modules: RawModule[];
}

export interface ValidateTokenResponse {
  code: string;
  message: string;
}

export interface JwtPayload {
  user_id: string;
  current_company_id: string;
  email: string;
  name: string;
  created_at: number;
  exp: number;
}

export interface AuthUser {
  id: string;
  companyId: string;
  email: string;
  name: string;
  createdAt: number;
  exp: number;
}

export interface AuthContextValue {
  user: AuthUser | null;
  permissions: NormalizedPermissions;
  modules: NormalizedModules;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (module: string, action: keyof PermissionActions) => boolean;
  logout: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
  initialToken: string | null;
  initialPermissions: NormalizedPermissions;
  initialModules: NormalizedModules;
}
