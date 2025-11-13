using ANG_API_Assess.Interface;
using ANG_API_Assess.Repositories;
using ANG_API_Assess.Services;
using APIKanini.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StreamingAPI.Data;
using StreamingAPI.Interface;
using StreamingAPI.Models;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// -------------------- Add services to the container --------------------
builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:5173") // Angular and React URLs
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Single registration for API explorer + swagger (no duplicates)
builder.Services.AddEndpointsApiExplorer();

// ---------- DbContext (uses the name 'context' you currently have) ----------
builder.Services.AddDbContext<context>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("conn")));

// -------------------- Repositories (use exact interface names in your project) --------------------
builder.Services.AddScoped<IStreaming<User>, UserRepository>();
builder.Services.AddScoped<IStreaming<SubscriptionPlan>, SubscriptionPlanRepository>();
builder.Services.AddScoped<IMediaRepository, MediaRepository>();
builder.Services.AddScoped<IPLaylistRepository, PlaylistRepository>(); // IPLaylistRepository (as in your code)
builder.Services.AddScoped<IPayment, PaymentRepository>(); // IPayment (as in your code)
builder.Services.AddScoped<IAdmin, AdminRepository>();

// -------------------- Token service --------------------
builder.Services.AddScoped<IToken, TokenService>();

// -------------------- Services --------------------
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<SubscriptionPlanService>();
builder.Services.AddScoped<MediaService>();
builder.Services.AddScoped<PlaylistService>();
builder.Services.AddScoped<PaymentService>();
builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<EmailService>();

// Add Memory Cache for OTP storage
builder.Services.AddMemoryCache();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<EmailService>();

// Add Memory Cache for OTP storage
builder.Services.AddMemoryCache();

// -------------------- HttpClient for external APIs --------------------
builder.Services.AddHttpClient<ANG_API_Assess.Controllers.YouTubeController>(client =>
{
    client.BaseAddress = new Uri("https://www.googleapis.com/");
    client.Timeout = TimeSpan.FromSeconds(30);
});

// -------------------- Authentication - JWT (guard against missing key) --------------------
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    // Fail fast with clear message  prevents passing null into Encoding.GetBytes and confusing runtime errors.
    throw new InvalidOperationException("JWT key is not configured. Please set 'Jwt:Key' in appsettings or environment variables.");
}

var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = signingKey
    };
});

builder.Services.AddAuthorization();

// -------------------- Swagger / OpenAPI with JWT config --------------------
builder.Services.AddSwaggerGen(c =>
{
    c.SupportNonNullableReferenceTypes();

    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Streaming API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// -------------------- Build app --------------------
var app = builder.Build();

// -------------------- Configure middleware pipeline --------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "media")),
    RequestPath = "/media",
    ServeUnknownFileTypes = true,
    DefaultContentType = "application/octet-stream"
});

app.MapControllers();

app.Run();
