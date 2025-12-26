'use client';

import { useState, useEffect } from 'react';
import { ProductsResponse } from '@/types/product';
import { productService } from '@/services/productService';
import ProductCard from './ProductCard';
import Pagination from './Pagination';

const ProductList = () => {
  const [productsData, setProductsData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9); // จำนวนสินค้าต่อหน้า

  useEffect(() => {
    loadProducts(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const loadProducts = async (page: number, size: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts(page, size);
      setProductsData(data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('เกิดข้อผิดพลาดในการโหลดสินค้า');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // เลื่อนขึ้นด้านบน
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-gray-600">กำลังโหลดสินค้า...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg className="w-6 h-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>{error}</span>
        <div>
          <button className="btn btn-sm btn-outline" onClick={() => loadProducts(currentPage, pageSize)}>
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  if (!productsData || productsData.items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">ไม่พบสินค้า</h3>
        <p className="text-gray-500">ขณะนี้ยังไม่มีสินค้าในระบบ</p>
      </div>
    );
  }

  // Calculate pagination properties
  const totalPages = Math.ceil(productsData.totalItems / productsData.pageSize);
  const hasNextPage = productsData.pageNumber < totalPages;
  const hasPreviousPage = productsData.pageNumber > 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">รายการสินค้า</h2>
          <p className="text-gray-600 mt-1">
            แสดง {productsData.items.length} จาก {productsData.totalItems} รายการ
          </p>
        </div>
        
        {/* Page info */}
        <div className="text-sm text-gray-500">
          หน้า {productsData.pageNumber} จาก {totalPages}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productsData.items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={productsData.pageNumber}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ProductList;
