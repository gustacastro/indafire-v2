import { api } from '@/lib/axios';
import { TaxCategory } from '@/app/(protected)/taxes/taxes.facade';
import { parseCurrencyInputToCents } from '@/utils/currency';

export { parseCurrencyInputToCents };

export interface ProductInfo {
  name: string;
  fantasy_name: string;
  code: string;
  description: string;
  measurement_unit: string;
  measurement_amount: number;
  available_stock: number;
  barcode: string;
}

export interface ProductTax {
  ncm: string;
  cfop: string;
  production_cost: string;
  sale_price: string;
  center_costs: string;
  center_cost_especification: string;
  delivery_fee: string;
  applied_taxes_ids: string[];
}

export interface Product {
  id: string;
  info: ProductInfo;
  tax: ProductTax;
  files: Record<string, string>;
  applied_taxes: TaxCategory[];
}

export interface ProductsPagination {
  total_items: number;
  request_total_items: number;
}

export interface ProductsResponse {
  pagination: ProductsPagination;
  data: Product[];
}

export interface FetchProductsParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface CreateProductPayload {
  info: {
    name: string;
    fantasy_name: string;
    description: string;
    measurement_unit: string;
    measurement_amount: number;
    barcode: string;
  };
  tax: {
    ncm: string;
    cfop: string;
    production_cost: string;
    sale_price: string;
    center_costs: string;
    center_cost_especification: string;
    delivery_fee: string;
    applied_taxes_ids: string[];
  };
}

export type UpdateProductPayload = CreateProductPayload;

interface RawProduct {
  id: string;
  info: ProductInfo;
  tax: ProductTax;
  files: Record<string, string>;
  applied_taxes?: TaxCategory[];
}

interface RawProductsResponse {
  pagination: ProductsPagination;
  data: RawProduct[];
}

interface RawProductDetailResponse {
  data: {
    product: RawProduct;
    applied_taxes: TaxCategory[];
    files: Record<string, string>;
  };
}

interface RawCreateProductResponse {
  message: string;
  product_id: string;
}

interface RawTaxesResponse {
  pagination: { total_items: number; request_total_items: number };
  data: (TaxCategory & { category_id: string })[];
}

async function fetchProductTaxes(): Promise<TaxCategory[]> {
  const { data } = await api.get<RawTaxesResponse>('/taxes/?per_page=9999&page=1');
  return data.data
    .map((raw) => ({ ...raw, id: raw.category_id }))
    .filter((t) => t.applies_to === 'product');
}

export { fetchProductTaxes };

function enrichProduct(raw: RawProduct, allTaxes: TaxCategory[]): Product {
  const ids = raw.tax?.applied_taxes_ids ?? [];
  const applied_taxes = ids
    .map((id) => allTaxes.find((t) => t.category_id === id || t.id === id))
    .filter((t): t is TaxCategory => Boolean(t));
  return { ...raw, applied_taxes };
}

export async function fetchProducts(params: FetchProductsParams = {}): Promise<ProductsResponse> {
  const { page = 1, perPage = 10, search = '' } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('per_page', String(perPage));
  if (search) query.set('search_term', search);

  const [productsRes, allTaxes] = await Promise.all([
    api.get<RawProductsResponse>(`/products/?${query.toString()}`),
    fetchProductTaxes(),
  ]);

  return {
    pagination: productsRes.data.pagination,
    data: productsRes.data.data.map((raw) => enrichProduct(raw, allTaxes)),
  };
}

export async function getProductById(id: string): Promise<Product> {
  const { data } = await api.get<RawProductDetailResponse>(`/products/${id}`);
  const { product, applied_taxes, files } = data.data;
  return {
    ...product,
    files: files ?? product.files ?? {},
    applied_taxes: applied_taxes ?? [],
  };
}

export async function createProduct(payload: CreateProductPayload): Promise<string> {
  const { data } = await api.post<RawCreateProductResponse>('/products/create', payload);
  return data.product_id;
}

export async function updateProduct(id: string, payload: UpdateProductPayload): Promise<void> {
  await api.put(`/products/${id}`, payload);
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function uploadProductFiles(id: string, files: File[]): Promise<void> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  await api.post(`/products/${id}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function deleteProductFiles(id: string, fileNames: string[]): Promise<void> {
  await api.delete(`/products/${id}/files`, { data: fileNames });
}
