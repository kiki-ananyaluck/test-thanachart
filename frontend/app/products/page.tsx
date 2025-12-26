import ProductList from '@/components/ProductList';

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-base-200">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <ProductList />
      </div>
    </div>
  );
}
