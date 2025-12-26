import axios from 'axios';
import { Product, ProductsResponse } from '@/types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const productService = {
  async getProducts(pageNumber: number = 1, pageSize: number = 10): Promise<ProductsResponse> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/products/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }
};
