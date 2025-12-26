'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CartItemCard from '@/components/CartItemCard';
import { cartApiService } from '@/services/cartApiService';
import { paymentService } from '@/services/paymentService';
import CartService from '@/services/cartService';
import { Product } from '@/types/product';
import Swal from 'sweetalert2';

interface CartItem {
  product: Product;
  quantity: number;
}

const CartPage = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [grandTotal, setGrandTotal] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  const fetchCartItems = async () => {
    setIsLoading(true);
    try {
      const response = await cartApiService.getCartItems();
      setCartItems(response.items.map((item: any) => ({
        product: {
          id: item.productId,
          name: item.productName,
          price: item.price,
          description: item.productDescription || '',
          stockQuantity: item.availableStock // สต๊อกที่ยังซื้อได้ (หักในตะกร้าแล้ว)
        },
        quantity: item.quantity
      })));
      setGrandTotal(response.grandTotal);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลตะกร้าสินค้าได้',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    const result = await cartApiService.updateCartItem(productId, quantity);
    if (result.success) {
      await fetchCartItems();
      // แจ้งเตือน Navbar ให้อัพเดท
      CartService.triggerUpdate();
    } else {
      throw new Error(result.message);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    const result = await cartApiService.removeCartItem(productId);
    if (result.success) {
      await fetchCartItems();
      // แจ้งเตือน Navbar ให้อัพเดท
      CartService.triggerUpdate();
    } else {
      throw new Error(result.message);
    }
  };

  const handleClearCart = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'ยืนยันการล้างตะกร้า',
      text: 'คุณต้องการลบสินค้าทั้งหมดออกจากตะกร้าหรือไม่?',
      showCancelButton: true,
      confirmButtonText: 'ล้างตะกร้า',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });

    if (result.isConfirmed) {
      setIsProcessing(true);
      try {
        const apiResult = await cartApiService.clearCart();
        if (apiResult.success) {
          await fetchCartItems();
          // แจ้งเตือน Navbar ให้อัพเดท
          CartService.triggerUpdate();
          Swal.fire({
            icon: 'success',
            title: 'ล้างตะกร้าสำเร็จ',
            showConfirmButton: false,
            timer: 1500
          });
        } else {
          throw new Error(apiResult.message);
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถล้างตะกร้าได้',
          confirmButtonText: 'ตกลง'
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCheckout = async () => {
    // ตรวจสอบว่ามีสินค้าในตะกร้าหรือไม่
    if (cartItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'ตะกร้าสินค้าว่างเปล่า',
        text: 'กรุณาเพิ่มสินค้าลงตะกร้าก่อนชำระเงิน',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    // แสดงการยืนยัน
    const result = await Swal.fire({
      icon: 'question',
      title: 'ยืนยันการชำระเงิน',
      html: `
        <div class="text-left">
          <p class="mb-2">จำนวนสินค้า: <strong>${cartItems.length} รายการ</strong></p>
          <p class="mb-2">ยอดรวมทั้งสิ้น: <strong>${formatPrice(grandTotal)}</strong></p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'ยืนยันการชำระเงิน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280'
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsProcessing(true);

    try {
      // เตรียมข้อมูลสำหรับ payment
      const paymentItems = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      console.log('💳 Sending payment request:', paymentItems);

      // เรียก API ชำระเงิน
      const paymentResult = await paymentService.processPayment(paymentItems);

      if (paymentResult.success) {
        // ล้างตะกร้าหลังชำระเงินสำเร็จ
        await cartApiService.clearCart();
        await fetchCartItems();
        CartService.triggerUpdate();

        // แสดงข้อความสำเร็จ
        await Swal.fire({
          icon: 'success',
          title: 'ชำระเงินสำเร็จ!',
          html: `
            <div class="text-left">
              ${paymentResult.orderId ? `<p class="mb-2">หมายเลขคำสั่งซื้อ: <strong>${paymentResult.orderId}</strong></p>` : ''}
              <p class="mb-2">ยอดชำระ: <strong>${formatPrice(paymentResult.total || grandTotal)}</strong></p>
              <p class="text-sm text-gray-600">ขอบคุณสำหรับการสั่งซื้อ</p>
            </div>
          `,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#10b981'
        });

        // กลับไปหน้าสินค้า
        router.push('/products');
      } else {
        throw new Error(paymentResult.message || 'การชำระเงินล้มเหลว');
      }
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message || 'ไม่สามารถดำเนินการชำระเงินได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueShopping = () => {
    router.push('/products');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-gray-600">กำลังโหลดตะกร้าสินค้า...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            ตะกร้าสินค้าของฉัน
          </h1>
          <button
            onClick={handleContinueShopping}
            className="btn btn-outline btn-primary gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ย้อนกลับ
          </button>
        </div>

        {cartItems.length === 0 ? (
          // Empty Cart
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body items-center text-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">ตะกร้าสินค้าว่างเปล่า</h2>
              <p className="text-gray-500 mb-6">คุณยังไม่มีสินค้าในตะกร้า</p>
              <button
                onClick={handleContinueShopping}
                className="btn btn-primary btn-wide"
              >
                เริ่มช้อปปิ้ง
              </button>
            </div>
          </div>
        ) : (
          // Cart with Items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Table */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  สินค้าในตะกร้า ({cartItems.length} รายการ)
                </h2>
                <button
                  onClick={handleClearCart}
                  disabled={isProcessing}
                  className="btn btn-outline btn-error btn-sm gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  ล้างตะกร้า
                </button>
              </div>

              <div className="card bg-base-100 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left text-sm font-bold text-gray-700 uppercase tracking-wider py-4 px-4">
                          PRODUCT
                        </th>
                        <th className="text-center text-sm font-bold text-gray-700 uppercase tracking-wider py-4 px-4">
                          PRICE
                        </th>
                        <th className="text-center text-sm font-bold text-gray-700 uppercase tracking-wider py-4 px-4">
                          QUANTITY
                        </th>
                        <th className="text-center text-sm font-bold text-gray-700 uppercase tracking-wider py-4 px-4">
                          SUBTOTAL
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <CartItemCard
                          key={item.product.id}
                          product={item.product}
                          quantity={item.quantity}
                          onUpdateQuantity={handleUpdateQuantity}
                          onRemove={handleRemoveItem}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="card bg-base-100 shadow-lg sticky top-4">
                <div className="card-body">
                  <h2 className="card-title text-2xl font-bold mb-4">สรุปรายการ</h2>
                  
                  <div className="divider my-2"></div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ยอดรวมสินค้า:</span>
                      <span className="font-semibold">{formatPrice(grandTotal)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ค่าจัดส่ง:</span>
                      <span className="font-semibold text-success">ฟรี</span>
                    </div>
                    
                    <div className="divider my-2"></div>
                    
                    <div className="flex justify-between items-center text-xl">
                      <span className="font-bold">ยอดรวมทั้งสิ้น:</span>
                      <span className="font-bold text-primary">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>
                  
                  <div className="divider my-2"></div>
                  
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="btn btn-primary btn-lg w-full gap-2 text-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    ดำเนินการชำระเงิน
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
