using Domain.Entities;

namespace Application.Interfaces;

public interface IProductRepository
{
    Task<IEnumerable<Product>> GetAllAsync();
    Task<Product?> GetByIdAsync(Guid id);
    Task<(IEnumerable<Product> Products, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
    Task UpdateProductAsync(Product product);
    Task<Product?> GetByIdWithStockAsync(Guid id);
}
