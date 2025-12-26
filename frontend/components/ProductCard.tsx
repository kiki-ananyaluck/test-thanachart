'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import CartService from '@/services/cartService';
import QuantitySelector from './QuantitySelector';
import Swal from 'sweetalert2';
import { cartApiService } from '@/services/cartApiService';

interface ProductCardProps {
  product: Product & {
    availableStock?: number;     // สต๊อกที่ซื้อได้จริง (หักตะกร้าแล้ว)
    quantityInCart?: number;     // จำนวนที่อยู่ในตะกร้า
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  // ใช้ availableStock จาก backend ถ้ามี ไม่งั้นใช้ stockQuantity
  const availableStock = product.availableStock ?? product.stockQuantity;
  const cartQuantity = product.quantityInCart ?? 0;
  
  const [quantity, setQuantity] = useState(availableStock > 0 ? 1 : 0);
  const [currentStock, setCurrentStock] = useState(availableStock);
  const [quantityInCart, setQuantityInCart] = useState(cartQuantity);

  // อัพเดทเมื่อ product prop เปลี่ยน (เช่น refetch from API)
  useEffect(() => {
    const newAvailableStock = product.availableStock ?? product.stockQuantity;
    const newCartQuantity = product.quantityInCart ?? 0;
    
    setCurrentStock(newAvailableStock);
    setQuantityInCart(newCartQuantity);
    setQuantity(newAvailableStock > 0 ? 1 : 0);
  }, [product.availableStock, product.quantityInCart, product.stockQuantity]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  const handleAddToCart = async () => {
    try {
      // ยิง API ไปที่เซิร์ฟเวอร์
      const apiResult = await cartApiService.addToCart(product.id, quantity);

      if (!apiResult.success) {
        throw new Error(apiResult.message || 'Failed to add item to cart');
      }

      // อัพเดท local state (จริงๆ ควร refetch จาก backend)
      const newQuantityInCart = quantityInCart + quantity;
      const newAvailableStock = Math.max(0, currentStock - quantity);
      
      setQuantityInCart(newQuantityInCart);
      setCurrentStock(newAvailableStock);
      setQuantity(newAvailableStock > 0 ? 1 : 0);
      
      // อัพเดท local cart (สำหรับ fallback)
      const productWithCurrentStock = { ...product, stockQuantity: currentStock };
      CartService.addToCart(productWithCurrentStock, quantity);
      
      Swal.fire({
        icon: 'success',
        title: 'เพิ่มสินค้าลงตะกร้าแล้ว',
        showConfirmButton: false,
        timer: 2000
      });
      
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มสินค้า:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเพิ่มสินค้าลงตะกร้าได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <div className="card-body p-6">
        <h2 className="card-title text-lg font-bold text-gray-800 mb-2">
          {product.name}
        </h2>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          <div className="flex flex-col items-end gap-1">
            <div className="badge badge-outline">
              คงเหลือ {currentStock} ชิ้น
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            max={currentStock}
          />
          
          <button
            onClick={handleAddToCart}
            disabled={currentStock === 0}
            className="btn btn-primary w-full"
          >
            {currentStock === 0 ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
