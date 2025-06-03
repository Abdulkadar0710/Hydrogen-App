import { json } from "@shopify/remix-oxygen";   

export async function loader({request, context}) {

    return json({
        message: productId, 
    });
     
}

export async function action({ request, context }) {    

    const requestBody = await request.json();
    const productId = requestBody.productId;


    const CUSTOMER_ACCESS_TOKEN = '5ccb00a6ce180d7b892f57cce0124e5d'; // Replace this with actual token

    const storefrontRes = await context.storefront.query(`
        query getCustomer($accessToken: String!) {
          customer(customerAccessToken: $accessToken) {
            id
          }
        }
      `, {
        variables: {
          accessToken: CUSTOMER_ACCESS_TOKEN,
        },
      });
  
      const customer = storefrontRes?.customer;
      if (!customer) {
        return json({ error: 'Invalid customer access token' }, { status: 401 });
      }
  
      const customerId = customer.id;



          // Step 2: Get existing metafield from Admin API
    const metafieldsRes = await fetch(`https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': context.env.PRIVATE_STOREFRONT_API_TOKEN,
        },
        body: JSON.stringify({
          query: `
            query {
              customer(id: "${customerId}") {
                metafield(namespace: "custom", key: "last_viewed_products") {
                  id
                  value
                }
              }
            }
          `,
        }),
      });
  
      const metafieldData = await metafieldsRes.json(); 
    let existingValue = metafieldData?.data?.customer?.metafield?.value || "";




    //get the limit for recently viewed items from metaObjects
    const metaObj = await fetch(`https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': context.env.PRIVATE_STOREFRONT_API_TOKEN, // Admin token here!
      },
      body: JSON.stringify({
          query: `
            query {
              metaobjects(type: "maxRecentItemsLimit", first: 1) {
                nodes {
                  id
                  handle
                  type
                  fields {
                    key
                    value
                  }
                }
              }
            }
          `,
        }),
      });
    
    const dd = await metaObj.json();
    const val = dd.data.metaobjects.nodes[0].fields[0].value;
    // console.log("MetaObject Value: ", val); 


    

      let parsedValue = existingValue.split(" ");

      parsedValue = parsedValue.filter((id) => id != productId); // Remove the productId if it already exists

      parsedValue.unshift(productId);
      parsedValue = parsedValue.slice(0, val); // Limit to the first 9 values


      const updatedValue = parsedValue.join(" ");

  // Step 3: Update metafield via Admin API
  const mutationRes = await fetch(`https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': context.env.PRIVATE_STOREFRONT_API_TOKEN,
    },
    body: JSON.stringify({
      query: `
        mutation customerUpdate($input: CustomerInput!) {
          customerUpdate(input: $input) {
            customer {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        input: {
          id: customerId,
          metafields: [{
            namespace: "custom",
            key: "last_viewed_products",
            type: "single_line_text_field",
            value: updatedValue,
          }],
        },
      },
    }),
  });

  const updateData = await mutationRes.json();



    return json({
       returnFrom: productId,
       customer: customer,
       parsedValue: parsedValue,
       updatedValue: updatedValue
    },{
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Content-Type': 'application/json',
        }
    });
}