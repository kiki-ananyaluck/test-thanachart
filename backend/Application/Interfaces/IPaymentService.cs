using Application.DTOs;

namespace Application.Interfaces;

public interface IPaymentService
{
    Task<bool> ProcessPaymentAsync(PaymentRequestDto paymentRequest);
}