using ANG_API_Assess.Interface;
using Microsoft.Extensions.Caching.Memory;

namespace ANG_API_Assess.Services
{
    public class OtpService : IOtpService
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<OtpService> _logger;

        public OtpService(IMemoryCache cache, ILogger<OtpService> logger)
        {
            _cache = cache;
            _logger = logger;
        }

        public string GenerateOtp()
        {
            var otp = new Random().Next(100000, 999999).ToString();
            _logger.LogInformation("OTP generated successfully");
            return otp;
        }

        public void StoreOtp(string email, string otp)
        {
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(5));
            
            _cache.Set($"OTP_{email}", otp, cacheOptions);
            _logger.LogInformation($"OTP stored for email: {email}, expires in 5 minutes");
        }

        public bool ValidateOtp(string email, string otp)
        {
            if (_cache.TryGetValue($"OTP_{email}", out string cachedOtp))
            {
                bool isValid = cachedOtp == otp;
                _logger.LogInformation($"OTP validation for {email}: {(isValid ? "Success" : "Failed")}");
                return isValid;
            }
            _logger.LogWarning($"OTP not found or expired for email: {email}");
            return false;
        }

        public void RemoveOtp(string email)
        {
            _cache.Remove($"OTP_{email}");
            _logger.LogInformation($"OTP removed for email: {email}");
        }
    }
}
