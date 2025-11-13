using System.Net;
using System.Net.Mail;

namespace ANG_API_Assess.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendOtpEmailAsync(string toEmail, string otp)
        {
            try
            {
                var fromEmail = _configuration["Email:FromEmail"];
                var appPassword = _configuration["Email:AppPassword"];

                var smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential(fromEmail, appPassword),
                    EnableSsl = true,
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail),
                    Subject = "Password Reset OTP - Spotify Clone",
                    Body = $@"
                        <html>
                        <body style='font-family: Arial, sans-serif;'>
                            <h2 style='color: #1db954;'>Password Reset Request</h2>
                            <p>Your OTP for password reset is:</p>
                            <h1 style='color: #1db954; font-size: 32px;'>{otp}</h1>
                            <p>This OTP will expire in 5 minutes.</p>
                            <p>If you didn't request this, please ignore this email.</p>
                        </body>
                        </html>
                    ",
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(toEmail);

                await smtpClient.SendMailAsync(mailMessage);
                _logger.LogInformation($"OTP email sent successfully to: {toEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to send OTP email to {toEmail}: {ex.Message}");
                throw;
            }
        }
    }
}
