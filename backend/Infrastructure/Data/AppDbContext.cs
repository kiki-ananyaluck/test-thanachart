using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class AppDbContext : DbContext
{
  public AppDbContext(DbContextOptions<AppDbContext> options)
      : base(options)
  {
  }

  public DbSet<Product> Products => Set<Product>();
  public DbSet<Stock> Stocks => Set<Stock>();
  public DbSet<Cart> Carts => Set<Cart>();

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    modelBuilder.HasPostgresExtension("pgcrypto");

    modelBuilder.Entity<Product>(entity =>
    {
      entity.ToTable("products");

      entity.HasKey(p => p.Id);

      entity.Property(p => p.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

      entity.Property(p => p.Name)
            .HasColumnName("name")
            .IsRequired()
            .HasMaxLength(200);

      entity.Property(p => p.Price)
            .HasColumnName("price")
            .HasColumnType("numeric(18,2)");

      entity.HasOne(p => p.Stock)
            .WithOne(s => s.Product)
            .HasForeignKey<Stock>(s => s.ProductId);
    });

    modelBuilder.Entity<Stock>(entity =>
    {
      entity.ToTable("stocks");

      entity.HasKey(s => s.Id);

      entity.Property(s => s.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

      entity.Property(s => s.ProductId)
            .HasColumnName("product_id");

      entity.Property(s => s.Quantity)
            .HasColumnName("quantity")
            .IsRequired();
    });

    // Cart  ⭐ เพิ่มใหม่
    modelBuilder.Entity<Cart>(entity =>
    {
      entity.ToTable("carts");

      entity.HasKey(c => c.Id);

      entity.Property(c => c.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

      entity.Property(c => c.ProductId)
            .HasColumnName("product_id")
            .IsRequired();

      entity.Property(c => c.Quantity)
            .HasColumnName("quantity")
            .IsRequired();

      entity.HasOne(c => c.Product)
            .WithMany(p => p.Carts)
            .HasForeignKey(c => c.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    });
  }



}
