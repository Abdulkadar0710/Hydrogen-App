import { json } from '@shopify/remix-oxygen';

export async function action({ context, request }) {
  const body = await request.json();
  const customerAccessToken = 'b6c74bd7c44c237f5b38471dffcf16d6'; // Your existing token
  
  if (!customerAccessToken) {
    return json({ error: 'Missing customer access token' }, { status: 401 });
  }

  // First, get the customer ID from the access token using Storefront API
  const CUSTOMER_QUERY = `
    query GetCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
      }
    }
  `;

  const customerResponse = await context.storefront.query(CUSTOMER_QUERY, {
    variables: { customerAccessToken }
  });

  const customerId = customerResponse?.customer?.id;

  // console.log("Customer ID: ", customerId);
  
  if (!customerId) {
    return json({ error: 'Invalid customer access token' }, { status: 401 });
  }

  // Extract just the numeric ID from the GID (it's already in the right format from Storefront API)
  // Storefront API returns: "gid://shopify/Customer/1234567890"
  // Admin API expects: "gid://shopify/Customer/1234567890" (same format)

  const wishlistData = JSON.stringify(body); // Assuming request.body contains the wishlist data
  console.log("Wishlist Data: ", wishlistData);

  // Admin API mutation for updating customer metafields
  const MUTATION = `
    mutation UpdateCustomerMetafield($customerId: ID!, $metafields: [MetafieldInput!]!) {
      customerUpdate(
        input: {
          id: $customerId
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
    customerId: customerId, // Already in correct GID format from Storefront API
    metafields: [
      {
        namespace: "custom",
        key: "wishl",
        value: wishlistData,
        type: "json"
      }
    ]
  };

  try {
    // Using Admin API instead of Storefront API
    const response = await context.admin.graphql(MUTATION, {
      variables,
    });

    const result = await response.json();

    if (result.data?.customerUpdate?.userErrors?.length > 0) {
      return json(
        { 
          error: 'Failed to update wishlist', 
          details: result.data.customerUpdate.userErrors 
        }, 
        { status: 400 }
      );
    }

    return json({
      success: true,
      updatedMetafield: result.data?.customerUpdate?.customer?.metafield,
    });

  } catch (error) {
    console.error('Error updating customer metafield:', error);
    return json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}