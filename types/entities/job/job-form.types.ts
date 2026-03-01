export type FormMode = 'create' | 'edit';

export interface JobFormProps {
  mode: FormMode;
  jobId?: string;
}
