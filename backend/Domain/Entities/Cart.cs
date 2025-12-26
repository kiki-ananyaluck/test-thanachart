using System;

namespace Domain.Entities;

public class Cart
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ProductId { get; set; }     // รหัสสินค้า
    public int Quantity { get; set; }       // จำนวนในตะกร้า

    public Product Product { get; set; } = null!;
}
