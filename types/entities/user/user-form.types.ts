export type FormMode = 'create' | 'edit';

export interface UserFormProps {
  mode: FormMode;
  userId?: string;
}
