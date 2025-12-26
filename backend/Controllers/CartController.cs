using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;
using Application.DTOs;

namespace Api.Controllers;

[ApiController]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var cart = await _cartService.GetCartAsync();
        return Ok(cart);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetCartSummary()
    {
        var cartSummary = await _cartService.GetCartSummaryAsync();
        return Ok(cartSummary);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
    {
        await _cartService.AddToCartAsync(request.ProductId, request.Quantity);
        return Ok(new { message = "Item added to cart successfully" });
    }

    [HttpPut("items/{productId}")]
    public async Task<IActionResult> UpdateCartItem(Guid productId, [FromBody] UpdateCartItemRequest request)
    {
        await _cartService.UpdateCartItemAsync(productId, request.Quantity);
        return Ok(new { message = "Cart item updated successfully" });
    }

    [HttpDelete("items/{productId}")]
    public async Task<IActionResult> RemoveFromCart(Guid productId)
    {
        await _cartService.RemoveFromCartAsync(productId);
        return Ok(new { message = "Item removed from cart successfully" });
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        await _cartService.ClearCartAsync();
        return Ok(new { message = "Cart cleared successfully" });
    }
}
