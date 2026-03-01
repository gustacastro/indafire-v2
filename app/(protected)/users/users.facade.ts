import { api } from '@/lib/axios';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface UsersPagination {
  total_items: number;
  request_total_items: number;
}

export interface UsersResponse {
  status: string;
  pagination: UsersPagination;
  data: User[];
}

export interface FetchUsersParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface UserPermissions {
  view: boolean;
  edit: boolean;
  create: boolean;
  delete: boolean;
}

export interface UserDetail extends User {
  permissions: Record<string, UserPermissions>;
}

interface RawUserDetail extends User {
  permissions: Array<Record<string, UserPermissions>>;
}

export interface UserDetailResponse {
  status: string;
  user: RawUserDetail;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  permissions: Record<string, UserPermissions>;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  password?: string;
  permissions: Record<string, UserPermissions>;
}

export async function fetchUsers(params: FetchUsersParams = {}): Promise<UsersResponse> {
  const { page = 1, perPage = 10, search = '' } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('per_page', String(perPage));
  if (search) query.set('search_term', search);
  const { data } = await api.get<UsersResponse>(`/users/?${query.toString()}`);
  return data;
}

export async function getUserById(id: string): Promise<UserDetail> {
  const { data } = await api.get<UserDetailResponse>(`/users/${id}`);
  const raw = data.user;
  const permissions: Record<string, UserPermissions> = {};
  for (const entry of raw.permissions) {
    const key = Object.keys(entry)[0];
    permissions[key] = entry[key];
  }
  return { id: raw.id, email: raw.email, name: raw.name, permissions };
}

export async function createUser(payload: CreateUserPayload): Promise<void> {
  await api.post('/users/create', payload);
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<void> {
  await api.put(`/users/${id}`, payload);
}
