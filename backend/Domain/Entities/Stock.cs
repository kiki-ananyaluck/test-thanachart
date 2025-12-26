namespace Domain.Entities;

public class Stock
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }          // รหัสสินค้า (FK)
    public int Quantity { get; set; }            // จำนวนคงเหลือ
    public Product Product { get; set; } = null!;
}
