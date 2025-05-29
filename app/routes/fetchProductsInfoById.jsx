import { json } from '@remix-run/react'; // ← Make sure to use @remix-run/node for loaders, not react

export async function loader({context, request}) {
  // const id = request.body(id);
  const url = new URL(request.url);
  const id = url.searchParams.get('id'); // Get the 'id' parameter from the URL
  console.log("Product ID: ", id);
  const res = await fetch(`https://abdul-gwl.myshopify.com/admin/api/2024-04/products/${id}.json`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': context.env.PRIVATE_STOREFRONT_API_TOKEN, // Fix env reference
    },
  });


  const data = await res.json();
  console.log("Product Data: ", data);
  return json({ product: data});
}
