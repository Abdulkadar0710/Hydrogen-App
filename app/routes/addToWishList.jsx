import { json } from '@shopify/remix-oxygen';

export async function action({ context, request }) {

  const body = await request.json(); 
  console.log("Request Body: ", body);

  const wishlistData = JSON.stringify(body?.wishlist || []);
  const id = body?.customerId || null;
  console.log("customerId: ", id);
  console.log("Wishlist Data: ", wishlistData);


   

  // Using Storefront API (your original working approach) 
  const MUTATION = `
     mutation UpdateCustomerWishlist($input: CustomerInput!) {
      customerUpdate(input: $input) {
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
    input: {
      id: id,
      metafields: [
        {
          namespace: "custom",
          key: "wishl",
          type: "json",
          value: wishlistData,
        }
      ]
    }
  };

  // {
  //   "input": {
  //     "id": "gid://shopify/Customer/8068214227172",
  //     "metafields": [
  //       {
  //         "namespace": "custom",
  //         "key": "wishl",
  //         "type": "json",
  //         "value": "[{\"id\":\"gid://shopify/Product/111\",\"title\":\"Cool Shirt\",\"vendor\":\"Nike\",\"description\":\"A cool shirt\",\"handle\":\"cool-shirt\"}]"
  //       }
  //     ]
  //   }
  // }

  try {
    // Using fetch to call Storefront API directly

    const domain = context.env.PUBLIC_STORE_DOMAIN;
    const storefrontAccessToken = context.env.PRIVATE_STOREFRONT_API_TOKEN; 

    console.log('Storefront API URL:', domain);
    console.log("Storefront Access Token:", storefrontAccessToken);

    const storefrontUrl = `https://${domain}/admin/api/2024-04/graphql.json`;
    // const storefrontAccessToken = context.env.PUBLIC_STOREFRONT_API_TOKEN;

    if (!storefrontAccessToken) {
      console.error('Storefront API access token not available');
      return json({ error: 'Storefront API not configured' }, { status: 500 });
    }

    const response = await fetch(storefrontUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',  
        'X-Shopify-Access-Token': storefrontAccessToken, 
      },
      body: JSON.stringify({
        query: MUTATION,
        variables,
      }),
    });

    console.log('Response status:', response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response}`);
    }

    const result = await response.json();
    console.log('GraphQL response:', result);

    if (result?.data?.customerUpdate?.userErrors?.length > 0) {
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
      updatedMetafield: result,
    });

  } catch (error) {
    console.error('Error updating customer metafield:', error);
    return json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    );
  }
} 