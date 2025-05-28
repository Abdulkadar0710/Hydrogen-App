
import { json } from '@remix-run/react'

export async function loader({ context, request }) {

    const query = `
          query GetProductWithInventory($id: ID!) {
            product(id: $id) {
              id
              title
              vendor
              description
              handle
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    sku
                    inventoryQuantity
                    inventoryItem {
                      id
                      inventoryLevels(first: 10) {
                        edges {
                          node {
                            available
                            location {
                              id
                              name
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `; 

    const variables = 'gid://shopify/Product/8649203450084';
 
    const res = await fetch(`https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2024-04/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',  
          'X-Shopify-Access-Token': context.env.PRIVATE_STOREFRONT_API_TOKEN,
        }, 
        body: JSON.stringify({ query, variables }),
      });

      const jsonRes = await res.json();

      return json({  
        jsonRes
      });

} 