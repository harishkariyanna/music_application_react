using StreamingAPI.Models;

namespace ANG_API_Assess.Interface
{
    public interface IPayment
    {
        Task<IEnumerable<Payment>> GetAllPaymentsAsync();
        Task<Payment?> GetPaymentByIdAsync(int id);
        Task<IEnumerable<Payment>> GetPaymentsByUserIdAsync(int userId);
        Task<Payment> AddPaymentAsync(Payment payment);
        Task<Payment?> UpdatePaymentAsync(int id, Payment payment);
        Task<bool> DeletePaymentAsync(int id);
    }
}