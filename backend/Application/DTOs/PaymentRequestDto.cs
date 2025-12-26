namespace Application.DTOs;

public class PaymentRequestDto
{
    public List<PaymentItemDto> Items { get; set; } = new();
}

public class PaymentItemDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}