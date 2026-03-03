import { getUserById, UserDetail } from '@/app/(protected)/users/users.facade';
// import { api } from '@/lib/axios';

export { getUserById };
export type { UserDetail };

export interface UpdateProfilePayload {
  password?: string;
}

export async function updateProfile(id: string, payload: UpdateProfilePayload): Promise<void> {
  /* await api.put(`/users/${id}/profile`, payload); */
}
