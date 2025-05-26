import { json } from '@shopify/remix-oxygen';

export async function action({ request, context }) {
  const { storefront } = context;

  try {
    const body = await request.json();
    const { query, variables } = body;

    const data = await storefront.query(query, { variables });
    console.log('API Response:', data);
    return json({ data });
  } catch (error) {
    console.error('API Error:', error);
    return json({ error: 'Failed to fetch wishlist' }, { status: 500 }); 
  }
} 



