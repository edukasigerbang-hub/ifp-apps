export interface CatalogFilterRequest {
  subject?: string;
  grade?: number;
}

let current: CatalogFilterRequest | null = null;

export function setCatalogFilter(request: CatalogFilterRequest): void {
  current = request;
}

// Pembacaan harus idempoten: effect React berjalan dua kali di StrictMode.
// Pembersihan dilakukan eksplisit lewat clearCatalogFilter() setelah diterapkan.
export function getCatalogFilter(): CatalogFilterRequest | null {
  return current;
}

export function clearCatalogFilter(): void {
  current = null;
}
