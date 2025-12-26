namespace Domain.Entities;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();        // รหัสสินค้า
    public string Name { get; set; } = null!;   // ชื่อสินค้า
    public decimal Price { get; set; }          // ราคาขายต่อหน่วย
    public Stock Stock { get; set; } = null!;
    public ICollection<Cart> Carts { get; set; } = new List<Cart>();
}
