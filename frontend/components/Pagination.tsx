'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // จำนวนหน้าที่จะแสดงสูงสุด
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    // ปรับ start ใหม่ถ้า end ไม่พอ
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const handlePrevious = () => {
    if (hasPreviousPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-8">
      <div className="join">
        {/* ปุ่มก่อนหน้า */}
        <button 
          className={`join-item btn ${!hasPreviousPage ? 'btn-disabled' : ''}`}
          onClick={handlePrevious}
          disabled={!hasPreviousPage}
        >
          «
        </button>
        
        {/* หน้าแรกถ้าไม่ใช่ในช่วงที่แสดง */}
        {getPageNumbers()[0] > 1 && (
          <>
            <button 
              className="join-item btn"
              onClick={() => handlePageClick(1)}
            >
              1
            </button>
            {getPageNumbers()[0] > 2 && (
              <button className="join-item btn btn-disabled">...</button>
            )}
          </>
        )}
        
        {/* หมายเลขหน้าในช่วงที่แสดง */}
        {getPageNumbers().map(page => (
          <button
            key={page}
            className={`join-item btn ${page === currentPage ? 'btn-active' : ''}`}
            onClick={() => handlePageClick(page)}
          >
            {page}
          </button>
        ))}
        
        {/* หน้าสุดท้ายถ้าไม่ใช่ในช่วงที่แสดง */}
        {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
          <>
            {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
              <button className="join-item btn btn-disabled">...</button>
            )}
            <button 
              className="join-item btn"
              onClick={() => handlePageClick(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
        
        {/* ปุ่มถัดไป */}
        <button 
          className={`join-item btn ${!hasNextPage ? 'btn-disabled' : ''}`}
          onClick={handleNext}
          disabled={!hasNextPage}
        >
          »
        </button>
      </div>
    </div>
  );
}
