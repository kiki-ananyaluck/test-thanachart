import axios from 'axios';
import { get } from 'http';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

let cartCache: {
  items: any[];
  totalItems: number;
  grandTotal: number;
  itemCount: number;
} | null = null;
let lastFetchTime = 0;
let pendingFetch: Promise<any> | null = null;
const CACHE_DURATION = 2000;

export const cartApiService = {
  async addToCart(productId: string, quantity: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/cart/items`, { 
        productId, 
        quantity 
      });

      // Invalidate cache after adding
      cartCache = null;

      return { success: true };
    } catch (error: any) {
      console.error('Error adding item to cart:', error);
      if (error.response) {
        return { 
          success: false, 
          message: error.response.data?.message || `Failed to add item to cart: ${error.response.status} ${error.response.statusText}` 
        };
      }
      return { success: false, message: 'An unexpected error occurred' };
    }
  },

  async getCartItems(): Promise<{
    items: any[];
    totalItems: number;
    grandTotal: number;
    itemCount: number;
  }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/cart`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching cart items:', error);
      throw error;
    }
  },


  async getSummary(): Promise<{
    totalItems: number;
    grandTotal: number;
  }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/cart/summary`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching cart summary:', error);
      throw error;
    }
  },

  async updateCartItem(productId: string, quantity: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/cart/items/${productId}`, { 
        quantity 
      });

      // Invalidate cache after updating
      cartCache = null;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      if (error.response) {
        return { 
          success: false, 
          message: error.response.data?.message || `Failed to update cart item: ${error.response.status} ${error.response.statusText}` 
        };
      }
      return { success: false, message: 'An unexpected error occurred' };
    }
  },

  async removeCartItem(productId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/cart/items/${productId}`);

      // Invalidate cache after removing
      cartCache = null;

      return { success: true };
    } catch (error: any) {
      console.error('Error removing cart item:', error);
      if (error.response) {
        return { 
          success: false, 
          message: error.response.data?.message || `Failed to remove cart item: ${error.response.status} ${error.response.statusText}` 
        };
      }
      return { success: false, message: 'An unexpected error occurred' };
    }
  },

  async clearCart(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/cart`);

      // Invalidate cache after clearing
      cartCache = null;

      return { success: true };
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      if (error.response) {
        return { 
          success: false, 
          message: error.response.data?.message || `Failed to clear cart: ${error.response.status} ${error.response.statusText}` 
        };
      }
      return { success: false, message: 'An unexpected error occurred' };
    }
  },

  // Method to manually invalidate cache
  invalidateCache() {
    cartCache = null;
    lastFetchTime = 0;
  }
};
