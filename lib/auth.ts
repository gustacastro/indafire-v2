import { api } from '@/lib/axios';
import {
  LoginRequest,
  LoginResponse,
  ValidateTokenResponse,
  ModulesResponse,
  RawPermission,
  RawModule,
  NormalizedPermissions,
  NormalizedModules,
  JwtPayload,
  AuthUser,
} from '@/types/contexts/auth.types';

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', data);
  return response.data;
}

export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await api.get<ValidateTokenResponse>('/auth/validate_token', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.code === 'token_valid';
  } catch {
    return false;
  }
}

export async function fetchModules(token: string): Promise<NormalizedModules> {
  const response = await api.get<ModulesResponse>('/users/modules', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return normalizeModules(response.data.modules);
}

export function normalizePermissions(raw: RawPermission[]): NormalizedPermissions {
  const result: NormalizedPermissions = {};
  for (const entry of raw) {
    const key = Object.keys(entry)[0];
    result[key] = entry[key];
  }
  return result;
}

export function normalizeModules(raw: RawModule[]): NormalizedModules {
  const result: NormalizedModules = {};
  for (const entry of raw) {
    const key = Object.keys(entry)[0];
    result[key] = entry[key];
  }
  return result;
}

export function decodeToken(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload)) as JwtPayload;
    return {
      id: decoded.user_id,
      companyId: decoded.current_company_id,
      email: decoded.email,
      name: decoded.name,
      createdAt: decoded.created_at,
      exp: decoded.exp,
    };
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const user = decodeToken(token);
  if (!user) return true;
  return Date.now() / 1000 > user.exp;
}
