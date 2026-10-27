
using CcdiStudentApi.Data;
using CcdiStudentApi.Models;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var connectionString = builder.Configuration
    .GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Database connection string is missing.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)));

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("ReactApp");

app.MapGet("/", () =>
    "CCDI Student Account Management API is running.");
    

app.MapPost("/api/students", async (
    CreateStudentRequest request,
    AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.StudentNumber) ||
        string.IsNullOrWhiteSpace(request.FullName) ||
        string.IsNullOrWhiteSpace(request.Course))
    {
        return Results.BadRequest(new
        {
            message = "Student number, full name, and course are required."
        });
    }

    var studentNumber = request.StudentNumber.Trim();

    var exists = await db.Students
        .AnyAsync(s => s.StudentNumber == studentNumber);

    if (exists)
    {
        return Results.Conflict(new
        {
            message = "Student number already exists."
        });
    }

    var student = new Student
    {
        StudentNumber = studentNumber,
        FullName = request.FullName.Trim(),
        Course = request.Course.Trim()
    };

    db.Students.Add(student);
    await db.SaveChangesAsync();

    return Results.Created(
        $"/api/students/{student.StudentNumber}",
        student);
});



app.MapGet("/api/payments/{studentNumber}", async (
    string studentNumber,
    AppDbContext db) =>
{
    var payments = await db.Payments
        .Where(p => p.StudentNumber == studentNumber)
        .OrderByDescending(p => p.PaymentDate)
        .Select(p => new
        {
            p.Id,
            p.ReceiptNo,
            p.StudentNumber,
            p.PaymentDate,
            p.Amount,
            p.Method,
            p.Status
        })
        .ToListAsync();

    return Results.Ok(payments);
});

app.MapPost("/api/payments", async (
    CreatePaymentRequest request,
    AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.StudentNumber) ||
        string.IsNullOrWhiteSpace(request.ReceiptNo) ||
        request.Amount <= 0)
    {
        return Results.BadRequest(new
        {
            message = "Enter a student number, receipt number, and amount greater than zero."
        });
    }

    var studentExists = await db.Students
        .AnyAsync(s => s.StudentNumber == request.StudentNumber);

    if (!studentExists)
    {
        return Results.NotFound(new
        {
            message = "Student not found. Add the student record first."
        });
    }

    var receiptExists = await db.Payments
        .AnyAsync(p => p.ReceiptNo == request.ReceiptNo);

    if (receiptExists)
    {
        return Results.Conflict(new
        {
            message = "This receipt number already exists."
        });
    }

    var payment = new Payment
    {
        StudentNumber = request.StudentNumber,
        ReceiptNo = request.ReceiptNo.Trim(),
        PaymentDate = request.PaymentDate ?? DateTime.Today,
        Amount = request.Amount,
        Method = "Cash",
        Status = "Recorded"
    };

    db.Payments.Add(payment);
    await db.SaveChangesAsync();

    return Results.Created(
        $"/api/payments/{payment.StudentNumber}",
        payment);
});

app.Run();

public record CreatePaymentRequest(
    string StudentNumber,
    string ReceiptNo,
    decimal Amount,
    DateTime? PaymentDate);

public record CreateStudentRequest(
    string StudentNumber,
    string FullName,
    string Course);
