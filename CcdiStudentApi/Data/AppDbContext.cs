
using CcdiStudentApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CcdiStudentApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Student> Students => Set<Student>();

    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Student>()
            .HasKey(student => student.StudentNumber);

        modelBuilder.Entity<Payment>()
            .HasOne(payment => payment.Student)
            .WithMany(student => student.Payments)
            .HasForeignKey(payment => payment.StudentNumber);

        modelBuilder.Entity<Payment>()
            .Property(payment => payment.Amount)
            .HasPrecision(10, 2);

        modelBuilder.Entity<Payment>()
            .HasIndex(payment => payment.ReceiptNo)
            .IsUnique();
    }
}
