import { UserPermissions } from '@/app/(protected)/users/users.facade';

export interface PermissionsViewProps {
  permissions: Record<string, UserPermissions>;
  modules: Record<string, string>;
}
