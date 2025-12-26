using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;

namespace Application.Services;

public class CartService : ICartService
{
    private readonly ICartRepository _cartRepository;
    private readonly IProductRepository _productRepository;

    public CartService(ICartRepository cartRepository, IProductRepository productRepository)
    {
        _cartRepository = cartRepository;
        _productRepository = productRepository;
    }

    public async Task<CartResponseDto> GetCartAsync()
    {
        var cartItems = await _cartRepository.GetCartItemsAsync();
        
        var cartItemDtos = cartItems.Select(c => 
        {
            // คำนวณ available stock (สต็อกที่เหลือสามารถเพิ่มได้อีก)
            var totalInCartForThisProduct = cartItems.Where(x => x.ProductId == c.ProductId).Sum(x => x.Quantity);
            var availableStock = Math.Max(0, (c.Product.Stock?.Quantity ?? 0) - totalInCartForThisProduct + c.Quantity);
            
            return new CartItemDto
            {
                ProductId = c.ProductId,
                ProductName = c.Product.Name,
                Price = c.Product.Price,
                Quantity = c.Quantity,
                Total = c.Product.Price * c.Quantity,
                AvailableStock = availableStock
            };
        });

        return new CartResponseDto
        {
            Items = cartItemDtos,
            GrandTotal = cartItemDtos.Sum(item => item.Total),
            TotalItems = cartItemDtos.Sum(item => item.Quantity)
        };
    }

    public async Task<CartSummaryDto> GetCartSummaryAsync()
    {
        var cart = await GetCartAsync();
        
        return new CartSummaryDto
        {
            Items = cart.Items,
            TotalItems = cart.TotalItems,
            GrandTotal = cart.GrandTotal,
            ItemCount = cart.Items.Count()
        };
    }

    public async Task AddToCartAsync(Guid productId, int quantity)
    {
        var existingItem = await _cartRepository.GetCartItemByProductIdAsync(productId);
        
        if (existingItem != null)
        {
            existingItem.Quantity += quantity;
            await _cartRepository.UpdateCartItemAsync(existingItem);
        }
        else
        {
            var newCartItem = new Cart
            {
                ProductId = productId,
                Quantity = quantity
            };
            await _cartRepository.AddCartItemAsync(newCartItem);
        }
    }

    public async Task UpdateCartItemAsync(Guid productId, int quantity)
    {
        var cartItem = await _cartRepository.GetCartItemByProductIdAsync(productId);
        
        if (cartItem == null)
            throw new InvalidOperationException("Cart item not found");

        if (quantity <= 0)
        {
            await _cartRepository.RemoveCartItemAsync(productId);
        }
        else
        {
            cartItem.Quantity = quantity;
            await _cartRepository.UpdateCartItemAsync(cartItem);
        }
    }

    public async Task RemoveFromCartAsync(Guid productId)
    {
        await _cartRepository.RemoveCartItemAsync(productId);
    }

    public async Task ClearCartAsync()
    {
        await _cartRepository.ClearCartAsync();
    }
}
