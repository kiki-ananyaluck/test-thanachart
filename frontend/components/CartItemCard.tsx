'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import QuantitySelector from './QuantitySelector';
import Swal from 'sweetalert2';

interface CartItemCardProps {
  product: Product;
  quantity: number;
  onUpdateQuantity: (productId: string, quantity: number) => Promise<void>;
  onRemove: (productId: string) => Promise<void>;
}

const CartItemCard = ({ product, quantity, onUpdateQuantity, onRemove }: CartItemCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState(quantity);

  // Sync currentQuantity กับ quantity prop เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    setCurrentQuantity(quantity);
  }, [quantity]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  const handleQuantityChange = async (newQuantity: number) => {
    // ป้องกันการกดซ้ำขณะกำลังอัพเดท
    if (isUpdating) {
      return;
    }
    
    setIsUpdating(true);
    const oldQuantity = currentQuantity;
    setCurrentQuantity(newQuantity);
    
    try {
      await onUpdateQuantity(product.id, newQuantity);
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการอัพเดท:', error);
      // Revert on error
      setCurrentQuantity(oldQuantity);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถอัพเดทจำนวนสินค้าได้',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'ยืนยันการลบสินค้า',
      text: `คุณต้องการลบ "${product.name}" ออกจากตะกร้าหรือไม่?`,
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });

    if (result.isConfirmed) {
      setIsUpdating(true);
      try {
        await onRemove(product.id);
        Swal.fire({
          icon: 'success',
          title: 'ลบสินค้าสำเร็จ',
          showConfirmButton: false,
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบสินค้าได้',
          confirmButtonText: 'ตกลง'
        });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const subtotal = product.price * currentQuantity;

  return (
    <tr className={`border-b hover:bg-gray-50 ${isUpdating ? 'opacity-50' : ''}`}>
      {/* Product Column */}
      <td className="py-6 px-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-linear-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
            {product.description && (
              <p className="text-sm text-gray-500 mt-1">{product.description}</p>
            )}
          </div>
        </div>
      </td>

      {/* Price Column */}
      <td className="py-6 px-4 text-center">
        <p className="text-lg font-semibold text-gray-800">{formatPrice(product.price)}</p>
      </td>

      {/* Quantity Column */}
      <td className="py-6 px-4">
        <div className="flex flex-col items-center gap-2">
          <QuantitySelector
            value={currentQuantity}
            onChange={handleQuantityChange}
            min={1}
            max={product.stockQuantity}
            disabled={isUpdating}
          />
          <span className="text-xs text-gray-500">
            (คงเหลือ {product.stockQuantity} ชิ้น)
          </span>
        </div>
      </td>

      {/* Subtotal Column */}
      <td className="py-6 px-4 text-center">
        <div className="flex items-center justify-center gap-4">
          <p className="text-xl font-bold text-gray-800">{formatPrice(subtotal)}</p>
          <button
            onClick={handleRemove}
            disabled={isUpdating}
            className="btn btn-ghost btn-circle btn-sm text-error hover:bg-error/10"
            title="ลบสินค้า"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CartItemCard;
