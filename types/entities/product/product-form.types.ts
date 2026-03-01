export type ProductFormMode = 'create' | 'edit';

export interface ProductFormProps {
  mode: ProductFormMode;
  productId?: string;
}
