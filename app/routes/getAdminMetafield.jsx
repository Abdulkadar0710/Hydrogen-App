
import { json } from "@shopify/remix-oxygen";

export async function loader({ request, context }) {

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
  
      const customerId =  customer.id;



    const metafieldsRes = await fetch(`https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2024-01/graphql.json`, {
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
      
      const dd = await metafieldsRes.json();
      const val = dd.data.metaobjects.nodes[0].fields[0].value;
      

    
 return json({
    message: "This is a placeholder for the getAdminMetafield route.", customerId, val
 });
} 