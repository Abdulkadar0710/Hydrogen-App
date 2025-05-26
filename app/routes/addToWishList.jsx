import { json } from '@shopify/remix-oxygen';

export async function action({ context, request }) {
  const customerAccessToken = 'b6c74bd7c44c237f5b38471dffcf16d6'; // Replace this with dynamic logic

  if (!customerAccessToken) {
    return json({ error: 'Missing customer access token' }, { status: 401 });
  }

  const body = await request.json(); // Expecting { wishlist: [...] }
  const wishlistData = JSON.stringify(body?.wishlist || []);

  const MUTATION = `#graphql
    mutation UpdateCustomerWishlist($customerAccessToken: String!, $metafields: [MetafieldsSetInput!]!) {
      customerUpdate(
        customerAccessToken: $customerAccessToken,
        customer: {
          metafields: $metafields
        }
      ) {
        customer {
          id
          metafield(namespace: "custom", key: "wishl") {
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    customerAccessToken,
    metafields: [
      {
        namespace: 'custom',
        key: 'wishl',
        value: wishlistData,
        type: 'json',
      },
    ],
  };

  const response = await context.storefront.mutate(MUTATION, {
    variables,
  });

  return json({
    updatedMetafield: response,
  });
}

