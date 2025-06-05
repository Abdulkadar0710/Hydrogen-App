import {json} from '@shopify/remix-oxygen';
import  parse  from 'papaparse';

export async function action({request, context}) {

  console.log("Getting executed");

  const cartId = context.cart.getCartId();
  // console.log('Cart ID in Backend:', cartId);

  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || file.type !== 'text/csv') {
      return json({error: 'Invalid file type. Please upload a CSV file.'}, {status: 400});
    }


    // Parse CSV
    const csvText = await file.text();
    const parsedData = Papa.parse(csvText, { 
      header: true,
      skipEmptyLines: true,
    });
  
    if (parsedData.errors.length > 0) {
      return json({error: 'Error parsing CSV file', details: parsedData.errors}, {status: 400});
    }
  
    const records = parsedData.data;

    console.log('Parsed CSV Records:', records);

  const cartLines = [];
  let result = [];

  for (const row of records) {
    const sku = row.sku?.trim();
    const quantity = parseInt(row.quantity);
    console.log(`Adding SKU: ${sku}, Quantity: ${quantity}`);

    if (!sku || isNaN(quantity)) continue;

      // Query Admin API to get variantId
      const adminResponse = await fetch(`https://${context.env.PUBLIC_CHECKOUT_DOMAIN}/admin/api/2024-04/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': context.env.PRIVATE_STOREFRONT_API_TOKEN,
        },
        body: JSON.stringify({
          query: `
            query getVariantBySKU($sku: String!) {
              productVariants(first: 1, query: $sku) {
                nodes {
                  id
                  sku
                }
              }
            }
          `,
          variables: { sku },
        }),
      });
  
      const adminData = await adminResponse.json();
      const variant = adminData?.data?.productVariants?.nodes?.[0];

      if (variant?.id) {
        cartLines.push({
          merchandiseId: variant.id,
          quantity,
        });
      }
  }



  const updateCart = await context.storefront.mutate(
    `
    mutation AddLinesToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          lines(first: 10) {
            edges {
              node {
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                  }
                }
                quantity
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
    `,
    {
      variables: {
        cartId,
        lines: cartLines,
      },
    }
  );



    return json({
      message: 'File received successfully',
      filename: file.name,
      records: records,
      updateCart: updateCart
    }
  );
   
}
