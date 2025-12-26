'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CartService from '@/services/cartService';
import { cartApiService } from '@/services/cartApiService';
import { Cart } from '@/types/product';

export default function Navbar() {
  const router = useRouter();
  const [itemCount, setItemCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  // ฟังก์ชันสำหรับ fetch cart summary จาก API
  const fetchCartSummary = async () => {
    try {
      const cartData = await cartApiService.getSummary();
      setItemCount(cartData.totalItems || 0);
      setCartTotal(cartData.grandTotal || 0);
    } catch (error) {
      console.error('❌ Failed to fetch cart summary:', error);
      // ถ้า API ไม่พร้อม ให้ใช้ข้อมูลจาก local cart service
      const localCart = CartService.getCart();
      const localItemCount = localCart.items.reduce((count, item) => count + item.quantity, 0);
      setItemCount(localItemCount);
      setCartTotal(localCart.total);
    }
  };

  useEffect(() => {
    // Fetch cart summary จาก API เมื่อเข้ามาครั้งแรก
    fetchCartSummary();
    const unsubscribe = CartService.subscribe(async (updatedCart) => {
      await fetchCartSummary();
    });


    // ยกเลิกการสมัครเมื่อ component ถูก unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Rainbow Comics</a>
      </div>
      <div className="flex-none">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <div className="indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="badge badge-sm indicator-item">{itemCount}</span>
              )}
            </div>
          </div>
          <div
            tabIndex={0}
            className="card card-compact dropdown-content bg-base-100 z-50 mt-3 w-52 shadow"
          >
            <div className="card-body">
              <span className="text-lg font-bold">{itemCount} Items</span>
              <span className="text-info">Subtotal: ฿{cartTotal.toLocaleString()}</span>
              <div className="card-actions">
                <button 
                  className="btn btn-primary btn-block"
                  onClick={() => router.push('/cart')}
                >
                  View cart
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img
                alt="User Avatar"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                className="rounded-full"
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow"
          >
            <li>
              <a className="justify-between">
                Profile
                <span className="badge">New</span>
              </a>
            </li>
            <li><a>Settings</a></li>
            <li><a>Logout</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
