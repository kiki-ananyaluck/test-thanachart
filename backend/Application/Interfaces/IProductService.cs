using Application.DTOs;

namespace Application.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductResponseDto>> GetAllProductsAsync();
    Task<PagedResultDto<ProductResponseDto>> GetPagedProductsAsync(int pageNumber, int pageSize);
}
