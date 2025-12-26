using Application.DTOs;

namespace Application.Interfaces;

public interface ICartService
{
    Task<CartResponseDto> GetCartAsync();
    Task<CartSummaryDto> GetCartSummaryAsync();
    Task AddToCartAsync(Guid productId, int quantity);
    Task UpdateCartItemAsync(Guid productId, int quantity);
    Task RemoveFromCartAsync(Guid productId);
    Task ClearCartAsync();
}
