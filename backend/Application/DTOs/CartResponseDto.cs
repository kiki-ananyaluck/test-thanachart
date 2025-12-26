namespace Application.DTOs;

public class CartItemDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal Total { get; set; }
    public int AvailableStock { get; set; }
}

public class CartResponseDto
{
    public IEnumerable<CartItemDto> Items { get; set; } = null!;
    public decimal GrandTotal { get; set; }
    public int TotalItems { get; set; }
}

public class CartSummaryDto
{
    public IEnumerable<CartItemDto> Items { get; set; } = null!;
    public int TotalItems { get; set; }
    public decimal GrandTotal { get; set; }
    public int ItemCount { get; set; }
}
