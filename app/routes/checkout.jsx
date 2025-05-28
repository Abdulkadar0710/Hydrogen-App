import { Form, useActionData, json, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";

// export async function loader({ context, request }) {

//     const customerAccessToken = '5ccb00a6ce180d7b892f57cce0124e5d';

    
//   const query = `
//     query GetCustomerId($customerAccessToken: String!) {
//       customer(customerAccessToken: $customerAccessToken) {
//         id  
//       }
//     }
//   `;

//   const variables = {
//     customerAccessToken,
//   };
 
//   const response = await context.storefront.query(query, {variables});

//   return json({customerId: response?.customer?.id});

// } 


export async function action({context, request}) {
  try {
    const form = await request.formData();
 
    const firstName = form.get('firstName');
    const lastName = form.get('lastName');
    const email = form.get('email');
    const address1 = form.get('address1');
    const city = form.get('city');
    const province = form.get('province');
    const country = form.get('country');
    const zip = form.get('zip');
    const note = form.get('note') || '';


    const wishRes = await fetch('http://localhost:3000/wish'); // change to your actual domain
    let wishRaw = await wishRes.json();
    const wishData = JSON.parse(wishRaw.customer?.metafield?.value) || [];

       // Step 2: Get variant IDs using Storefront API
       const productIds = wishData.map(p => p.id);
       console.log("Product IDs: ", productIds);
       const query = `
         query GetVariants($ids: [ID!]!) { 
           nodes(ids: $ids) {
             ... on Product {
               id
               title
               variants(first: 1) {
                 nodes {
                   id
                 }
               }
             }
           }
         }
       `;
       const variables = { ids: productIds };
    //    const storefrontRes = await context.storefront.query(query, { variables });


    let results = [];
    for (const id of productIds) {
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
  
        const variables = id;
  
        const res = await fetch(`https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2024-04/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',  
            'X-Shopify-Access-Token': context.env.PRIVATE_STOREFRONT_API_TOKEN, 
          }, 
          body: JSON.stringify({ query, variables }),
        });
  
        const jsonRes = await res.json();
  
        if (jsonRes.errors) {
          console.error(`Error fetching product ${id}:`, jsonRes.errors);
          continue;
        }
  
        results.push(jsonRes);
      }




   
    //    const lineItems = storefrontRes.nodes
    //      .filter(node => node?.variants?.nodes?.[0]?.id)
    //      .map(node => ({
    //        variant_id: node.variants.nodes[0].id.split('/').pop(),
    //        quantity: 1
    //      }));

        // Step 4: Create draft order
        // const createRes = await fetch(
        //     `https://${process.env.PUBLIC_STORE_DOMAIN}/admin/api/2023-04/draft_orders.json`,
        //     {
        //       method: 'POST',
        //       headers: {
        //         'X-Shopify-Access-Token': process.env.PRIVATE_STOREFRONT_API_TOKEN,
        //         'Content-Type': 'application/json',
        //         Accept: 'application/json',
        //       },
        //       body: JSON.stringify(draftOrderInput),
        //     }
        //   );
      
        //   if (!createRes.ok) {
        //     const errText = await createRes.text();
        //     return json({ error: `Failed to create draft order: ${errText}` }, { status: 500 });
        //   }
      
        //   const { draft_order } = await createRes.json(); 


    return json({
        firstName,
        lastName,
        email,
        address1,
        city,
        province,
        country,
        zip,
        note,
        wishData,
        productIds,
        // storefrontRes,
        results
    });
    
 
    // if (
    //   !firstName || !lastName || !email || !address1 ||
    //   !city || !province || !country || !zip || !cartLinesJSON
    // ) {
    //   return json({error: 'Please fill all required fields'}, {status: 400});
    // }
 
    // const cartLines = JSON.parse(cartLinesJSON);
    // const lineItems = cartLines.map((line) => ({
    //   variant_id: line.variantId.split('/').pop(),
    //   quantity: Number(line.quantity) >= 1 ? Number(line.quantity) : 1, // Ensure qty ≥ 1
    // }));
 
    // const draftOrderInput = {
    //   draft_order: {
    //     line_items: lineItems,
    //     customer: {
    //       first_name: firstName,
    //       last_name: lastName,
    //       email,            // customer email here
    //     },
    //     email,              // top-level email required for order to have email
    //     shipping_address: {
    //       address1,
    //       city,
    //       province,
    //       country,
    //       zip,
    //     },
    //     note,
    //     use_customer_default_address: false,
    //     tags: 'Created via Hydrogen custom checkout',
    //     shipping_line: {
    //       title: 'Standard Shipping',
    //       price: '0.00',
    //       code: 'Free Shipping',
    //     },
    //     send_invoice: true,  // send email invoice automatically
    //   },
    // };
 
    // // Create draft order
    // const createRes = await fetch(
    //   `https://${SHOPIFY_DOMAIN}/admin/api/2023-04/draft_orders.json`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
    //       'Content-Type': 'application/json',
    //       Accept: 'application/json',
    //     },
    //     body: JSON.stringify(draftOrderInput),
    //   }
    // );
 
    // if (!createRes.ok) {
    //   const errText = await createRes.text();
    //   return json({error: `Failed to create draft order: ${errText}`}, {status: 500});
    // }
 
    // const {draft_order} = await createRes.json();
 
    // // Complete draft order to convert to actual order & charge
    // const completeRes = await fetch(
    //   `https://${SHOPIFY_DOMAIN}/admin/api/2023-04/draft_orders/${draft_order.id}/complete.json`,
    //   {
    //     method: 'PUT',
    //     headers: {
    //       'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
    //       'Content-Type': 'application/json',
    //       Accept: 'application/json',
    //     },
    //   }
    // );
 
    // if (!completeRes.ok) {
    //   const errText = await completeRes.text();
    //   return json({error: `Failed to complete order: ${errText}`}, {status: 500});
    // }
 
    // // Success — redirect to homepage or wherever you want
    // return redirect('/');
  } catch (error) {
    console.error('Checkout action error:', error);
    return json({error: 'Internal server error'}, {status: 500});
  } 
}

export default function Checkout(){

    const data = useActionData();

    // const loaderData = useLoaderData();
    // console.log("Loader Data: ", loaderData);

    // const loadWishList = async () => {         
    //     const response = await fetch('/wish', {
    //       method: 'GET', 
    //       headers: {
    //         'Content-Type': 'application/json'},
    //      });
     
    //     let res = await response.json();
    //     res = JSON.parse(res.customer?.metafield?.value) || [];
    
    //     return res;
    //   }

    useEffect(() => {
        console.log("Data from action: ", data);
        // const fetchWishlist = async () => {
        //     const wishData = await loadWishList();
        //     console.log("WishlistData: ", wishData);
        // };
        // fetchWishlist();
    }, [data]);
    

    return (
        <section className="max-auto text-center">
            <h1>Checkout</h1>
            <p>Checkout page is under construction.</p>
            <Form method="post" className="flex flex-col items-center justify-center mx-auto">
            <input required name="firstName" placeholder="First Name" className="p-2 border rounded m-2" />
            <input required name="lastName" placeholder="Last Name" className="p-2 border rounded m-2" />
            <input required type="email" name="email" placeholder="Email" className="p-2 border rounded m-2" />
            <input required name="address1" placeholder="Address" className="p-2 border rounded m-2" />
            <input required name="city" placeholder="City" className="p-2 border rounded m-2" />
            <input required name="province" placeholder="State/Province" className="p-2 border rounded m-2" />
            <input required name="country" placeholder="Country" className="p-2 border rounded m-2" />
            <input required name="zip" placeholder="Zip/Postal Code" className="p-2 border rounded m-2 " />
            <textarea name="note" placeholder="Order notes (optional)" className="p-2 border rounded m-4" rows={3} />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Complete Checkout</button>
            </Form>
        </section> 
    )
} 