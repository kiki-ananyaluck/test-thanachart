using Domain.Entities;

namespace Application.Interfaces;

public interface ICartRepository
{
    Task<IEnumerable<Cart>> GetCartItemsAsync();
    Task<Cart?> GetCartItemByProductIdAsync(Guid productId);
    Task AddCartItemAsync(Cart cartItem);
    Task UpdateCartItemAsync(Cart cartItem);
    Task RemoveCartItemAsync(Guid productId);
    Task ClearCartAsync();
}