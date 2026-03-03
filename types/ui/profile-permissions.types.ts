import { UserPermissions } from '@/app/(protected)/users/users.facade';

export interface ProfilePermissionsProps {
  permissions: Record<string, UserPermissions>;
  modules: Record<string, string>;
}
