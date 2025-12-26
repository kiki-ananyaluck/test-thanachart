using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace Infrastructure.Data.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _context;
    
    public ProductRepository(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<IEnumerable<Product>> GetAllAsync()
    {
        try
        {
            Log.Information("Getting all products from repository");
            var products = await _context.Products
                .Include(p => p.Stock)
                .ToListAsync();
            
            Log.Information("Retrieved {ProductCount} products from database", products.Count);
            return products;
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error retrieving products from repository");
            throw;
        }
    }
    
    public async Task<Product?> GetByIdAsync(Guid id)
    {
        try
        {
            Log.Information("Getting product with id: {ProductId} from repository", id);
            
            var product = await _context.Products
                .Include(p => p.Stock)
                .FirstOrDefaultAsync(p => p.Id == id);
                
            if (product == null)
            {
                Log.Warning("Product with id {ProductId} not found in database", id);
            }
            
            return product;
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error retrieving product with id: {ProductId} from repository", id);
            throw;
        }
    }
    
    public async Task<(IEnumerable<Product> Products, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
    {
        try
        {
            Log.Information("Getting paged products from repository: Page {PageNumber}, Size {PageSize}", pageNumber, pageSize);
            
            var totalItems = await _context.Products.CountAsync();
            var products = await _context.Products
                .Include(p => p.Stock)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            Log.Information("Retrieved {ProductCount} products for page {PageNumber} from database", products.Count, pageNumber);
            
            return (products, totalItems);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error retrieving paged products from repository: Page {PageNumber}, Size {PageSize}", pageNumber, pageSize);
            throw;
        }
    }

    public async Task UpdateProductAsync(Product product)
    {
        try
        {
            Log.Information("Updating product with id: {ProductId}", product.Id);
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            Log.Information("Product with id: {ProductId} updated successfully", product.Id);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error updating product with id: {ProductId}", product.Id);
            throw;
        }
    }

    public async Task<Product?> GetByIdWithStockAsync(Guid id)
    {
        try
        {
            Log.Information("Getting product with stock for id: {ProductId}", id);
            var product = await _context.Products
                .Include(p => p.Stock)
                .FirstOrDefaultAsync(p => p.Id == id);
            
            if (product == null)
            {
                Log.Warning("Product with id {ProductId} not found", id);
            }
            
            return product;
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error retrieving product with stock for id: {ProductId}", id);
            throw;
        }
    }
}
