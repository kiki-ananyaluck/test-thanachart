using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;

namespace Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IProductRepository _productRepository;

    public PaymentService(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<bool> ProcessPaymentAsync(PaymentRequestDto paymentRequest)
    {
        if (paymentRequest.Items == null || !paymentRequest.Items.Any())
        {
            throw new BadRequestException("ไม่มีสินค้าในการชำระเงิน");
        }

        // ตรวจสอบและลดสินค้าคงเหลือ
        foreach (var item in paymentRequest.Items)
        {
            var product = await _productRepository.GetByIdWithStockAsync(item.ProductId);
            
            if (product == null)
            {
                throw new NotFoundException($"ไม่พบสินค้ารหัส {item.ProductId}");
            }

            if (product.Stock.Quantity < item.Quantity)
            {
                throw new BadRequestException($"สินค้า {product.Name} มีจำนวนคงเหลือไม่เพียงพอ (เหลือ {product.Stock.Quantity})");
            }

            // ลดจำนวนสินค้าคงเหลือ
            product.Stock.Quantity -= item.Quantity;
            await _productRepository.UpdateProductAsync(product);
        }

        return true;
    }
}