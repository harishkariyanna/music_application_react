using ANG_API_Assess.Interface;
using StreamingAPI.Models;

namespace ANG_API_Assess.Services
{
    public class PaymentService
    {
        private readonly IPayment _paymentRepository;

        public PaymentService(IPayment paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        public async Task<IEnumerable<Payment>> GetAllPaymentsAsync()
        {
            return await _paymentRepository.GetAllPaymentsAsync();
        }

        public async Task<Payment?> GetPaymentByIdAsync(int id)
        {
            return await _paymentRepository.GetPaymentByIdAsync(id);
        }

        public async Task<IEnumerable<Payment>> GetPaymentsByUserIdAsync(int userId)
        {
            return await _paymentRepository.GetPaymentsByUserIdAsync(userId);
        }

        public async Task<Payment> AddPaymentAsync(Payment payment)
        {
            // Business Logic: Validate payment data
            if (payment.Amount <= 0)
                throw new ArgumentException("Payment amount must be greater than 0");
            
            if (payment.UserId <= 0)
                throw new ArgumentException("Valid user ID is required");
            
            if (payment.SubscriptionPlanId <= 0)
                throw new ArgumentException("Valid subscription plan ID is required");
            
            // Business Logic: Set payment date
            payment.PaymentDate = DateTime.UtcNow;
            
            return await _paymentRepository.AddPaymentAsync(payment);
        }

        public async Task<Payment?> UpdatePaymentAsync(int id, Payment payment)
        {
            // Business Logic: Validate before update
            var existingPayment = await _paymentRepository.GetPaymentByIdAsync(id);
            if (existingPayment == null)
                throw new KeyNotFoundException($"Payment with ID {id} not found");
            
            // Business Logic: Only allow status updates, not amount changes
            return await _paymentRepository.UpdatePaymentAsync(id, payment);
        }

        public async Task<bool> DeletePaymentAsync(int id)
        {
            // Business Logic: Check if payment exists
            var payment = await _paymentRepository.GetPaymentByIdAsync(id);
            if (payment == null)
                return false;
            
            // Business Logic: Could add rule like "cannot delete completed payments"
            return await _paymentRepository.DeletePaymentAsync(id);
        }
    }
}