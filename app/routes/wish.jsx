import { json } from '@shopify/remix-oxygen';

export async function loader({ context, request }) {
  const url = new URL(request.url);
  // TODO: Replace with dynamic customer access token retrieval
  const customerAccessToken = 'b6c74bd7c44c237f5b38471dffcf16d6'; 

  if (!customerAccessToken) {
    return json({ error: 'Missing customer access token' }, { status: 401 }); // 401 for unauthorized
  }

  const QUERY = `#graphql
    query GetCustomerWishlist($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        metafield(namespace: "custom", key: "wishl") {
          value
        }
      }
    }
  `;  

  const response = await context.storefront.query(QUERY, { 
    variables: { customerAccessToken },
  });

  const parsedWishlist = response?.customer?.metafield?.value
    ? JSON.parse(response.customer.metafield.value)
    : [];
  console.log("Parsed Wishlist:", parsedWishlist);
  return json(response);
}
