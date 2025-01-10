// app/products/page.tsx
async function fetchProducts() {
  const res = await fetch('http://localhost:3001/api/products');
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export default async function ProductsPage() {
  const products = await fetchProducts();

  return (
    <div>
      <h1>Product Listing</h1>
      <ul>
        {products.map((product: { id: string; name: string; price: string }) => (
          <li key={product.id}>
            <a href={`/products/${product.id}`}>{product.name}</a> - {product.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
