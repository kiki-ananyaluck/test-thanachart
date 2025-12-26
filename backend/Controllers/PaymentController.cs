using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Controllers;

[ApiController]
[Route("api/payment")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessPayment([FromBody] PaymentRequestDto paymentRequest)
    {
        var result = await _paymentService.ProcessPaymentAsync(paymentRequest);

        return Ok(new
        {
            success = result,
            message = "ชำระเงินสำเร็จ"
        });
    }
}