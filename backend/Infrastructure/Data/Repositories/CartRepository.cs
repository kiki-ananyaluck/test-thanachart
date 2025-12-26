using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Repositories;

public class CartRepository : ICartRepository
{
    private readonly AppDbContext _context;

    public CartRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Cart>> GetCartItemsAsync()
    {
        return await _context.Carts
            .Include(c => c.Product)
                .ThenInclude(p => p.Stock)
            .ToListAsync();
    }

    public async Task<Cart?> GetCartItemByProductIdAsync(Guid productId)
    {
        return await _context.Carts
            .Include(c => c.Product)
                .ThenInclude(p => p.Stock)
            .FirstOrDefaultAsync(c => c.ProductId == productId);
    }

    public async Task AddCartItemAsync(Cart cartItem)
    {
        await _context.Carts.AddAsync(cartItem);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateCartItemAsync(Cart cartItem)
    {
        _context.Carts.Update(cartItem);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveCartItemAsync(Guid productId)
    {
        var cartItem = await _context.Carts
            .FirstOrDefaultAsync(c => c.ProductId == productId);
        
        if (cartItem != null)
        {
            _context.Carts.Remove(cartItem);
            await _context.SaveChangesAsync();
        }
    }

    public async Task ClearCartAsync()
    {
        var cartItems = await _context.Carts.ToListAsync();
        _context.Carts.RemoveRange(cartItems);
        await _context.SaveChangesAsync();
    }
}
