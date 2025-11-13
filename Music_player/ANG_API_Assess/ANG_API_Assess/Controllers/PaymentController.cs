using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ANG_API_Assess.DTOs;
using ANG_API_Assess.Services;
using StreamingAPI.Models;

namespace ANG_API_Assess.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class PaymentController : ControllerBase
    {
        private readonly PaymentService _paymentService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(PaymentService paymentService, ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Payment>>> GetAllPayments()
        {
            _logger.LogInformation("Fetching all payments");
            var payments = await _paymentService.GetAllPaymentsAsync();
            return Ok(payments);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Payment>>> GetUserPayments(int userId)
        {
            _logger.LogInformation($"Fetching payments for user: {userId}");
            var payments = await _paymentService.GetPaymentsByUserIdAsync(userId);
            return Ok(payments);
        }

        [HttpPost]
        public async Task<ActionResult<Payment>> CreatePayment(PaymentDto paymentDto)
        {
            _logger.LogInformation($"Creating payment for user: {paymentDto.UserId}");
            var payment = new Payment
            {
                UserId = paymentDto.UserId,
                SubscriptionPlanId = paymentDto.SubscriptionPlanId,
                Amount = paymentDto.Amount,
                PaymentDate = paymentDto.PaymentDate,
                Status = paymentDto.Status,
                TransactionId = paymentDto.TransactionId
            };

            var created = await _paymentService.AddPaymentAsync(payment);
            _logger.LogInformation($"Payment created successfully: {created.PaymentId}");
            return CreatedAtAction(nameof(GetUserPayments), new { userId = created.UserId }, created);
        }
    }
}