import { UserPermissions } from '@/app/(protected)/users/users.facade';

export interface PermissionsEditorProps {
  permissions: Record<string, UserPermissions>;
  modules: Record<string, string>;
  onChange: (permissions: Record<string, UserPermissions>) => void;
}
