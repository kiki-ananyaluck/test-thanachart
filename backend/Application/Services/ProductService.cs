using Application.DTOs;
using Application.Interfaces;
using Application.Exceptions;
using Domain.Entities;
using Serilog;

namespace Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly ICartRepository _cartRepository;
    
    public ProductService(IProductRepository productRepository, ICartRepository cartRepository)
    {
        _productRepository = productRepository;
        _cartRepository = cartRepository;
    }
    
    public async Task<IEnumerable<ProductResponseDto>> GetAllProductsAsync()
    {
        try
        {
            Log.Information("Getting all products");
            var products = await _productRepository.GetAllAsync();
            var cartItems = await _cartRepository.GetCartItemsAsync();
            
            Log.Information("Retrieved {ProductCount} products", products.Count());
            
            var productDtos = products.Select(p => 
            {
                var cartQuantity = cartItems.Where(c => c.ProductId == p.Id).Sum(c => c.Quantity);
                var availableStock = Math.Max(0, (p.Stock?.Quantity ?? 0) - cartQuantity);
                
                return new ProductResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    StockQuantity = availableStock
                };
            })
            .OrderBy(p => p.Name); // เรียงตามชื่อ
            
            return productDtos;
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error retrieving products");
            throw;
        }
    }
    
    public async Task<PagedResultDto<ProductResponseDto>> GetPagedProductsAsync(int pageNumber, int pageSize)
    {
        try
        {
            Log.Information("Getting paged products: Page {PageNumber}, Size {PageSize}", pageNumber, pageSize);
            
            var (products, totalItems) = await _productRepository.GetPagedAsync(pageNumber, pageSize);
            var cartItems = await _cartRepository.GetCartItemsAsync();
            
            Log.Information("Retrieved {ProductCount} products for page {PageNumber}", products.Count(), pageNumber);
            
            var productDtos = products.Select(p => 
            {
                var cartQuantity = cartItems.Where(c => c.ProductId == p.Id).Sum(c => c.Quantity);
                var availableStock = Math.Max(0, (p.Stock?.Quantity ?? 0) - cartQuantity);
                
                return new ProductResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    StockQuantity = availableStock
                };
            })
            .OrderBy(p => p.Name); // เรียงตามชื่อ
            
            return new PagedResultDto<ProductResponseDto>
            {
                Items = productDtos,
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error retrieving paged products: Page {PageNumber}, Size {PageSize}", pageNumber, pageSize);
            throw;
        }
    }
}
