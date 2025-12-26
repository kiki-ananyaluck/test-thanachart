using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;

namespace Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllProducts()
    {
        var products = await _productService.GetAllProductsAsync();
        return Ok(products);
    }

    //pagination 
    [HttpGet("paged")]
    public async Task<IActionResult> GetPagedProducts([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var pagedProducts = await _productService.GetPagedProductsAsync(pageNumber, pageSize);
        return Ok(pagedProducts);
    }
}
