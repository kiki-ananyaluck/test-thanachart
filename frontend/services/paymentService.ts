import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface PaymentItemDto {
  productId: string;
  quantity: number;
}

export interface PaymentRequestDto {
  items: PaymentItemDto[];
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  orderId?: string;
  total?: number;
}

export const paymentService = {
  async processPayment(items: PaymentItemDto[]): Promise<PaymentResponse> {
    try {
      console.log('💳 Processing payment with items:', items);
      
      const requestDto: PaymentRequestDto = {
        items: items
      };

      const response = await axios.post(`${API_BASE_URL}/payment/process`, requestDto);
      
      console.log('✅ Payment processed successfully:', response.data);
      return {
        success: true,
        ...response.data
      };
    } catch (error: any) {
      console.error('❌ Payment processing failed:', error);
      
      if (error.response) {
        return {
          success: false,
          message: error.response.data?.message || `Payment failed: ${error.response.status} ${error.response.statusText}`
        };
      }
      
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองใหม่อีกครั้ง'
      };
    }
  }
};
