// /types/product.ts
export interface ProductImage {
  _id?: string;
  url: string;
  color?: string | null;
  size?: string | null;
  stock?: number;
  description?: string;
}

export interface Category {
  _id: string;
  nom: string;
}

export interface Product {
  _id: string;
  nom: string;
  description?: string;        // peut être undefined
  prix: number;
  stock: number;
  volume?: string;
  benefaits?: string[];
  categoryId: string | Category;  // soit l'ID, soit l'objet populé
  images?: ProductImage[];         // peut être undefined
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}