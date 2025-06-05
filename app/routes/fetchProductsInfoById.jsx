import { json } from '@shopify/remix-oxygen'; // ✅ Use correct import

export async function loader({ context, request }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing ID' }), {
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': 'https://abdul-gwl.myshopify.com',
        'Content-Type': 'application/json',
      },
    });
  }

  const response = await fetch(`https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2024-04/products/8649197551844.json`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': context.env.PRIVATE_STOREFRONT_API_TOKEN, // ✅ Admin API token required here
    },
  });

  const data = await response.json();

  return new Response(JSON.stringify({ product: data }), {
    headers: {
      'Access-Control-Allow-Origin': 'https://abdul-gwl.myshopify.com', // ✅ Allow your Shopify store
      'Content-Type': 'application/json',
    },
  });
}



