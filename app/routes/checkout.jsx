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


export async function action({ context, request }) {
  try {
    const qu = `
  query GetCustomerEmail($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      email
    }
  }
`; 
 
const vari = {
  customerAccessToken: '5ccb00a6ce180d7b892f57cce0124e5d', 
}; 

const response = await context.storefront.query(qu, { vari });

const email = response?.customer?.email;

    const form = await request.formData();

    // const firstName = form.get('firstName');
    // const lastName = form.get('lastName');
    // const email = form.get('email');
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
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            quantityAvailable
          }
        }
      }
    }
  }
`;

    const variables = { ids: productIds };
    const storefrontRes = await context.storefront.query(query, { variables });

    const lineItems = storefrontRes.nodes
  .filter(node => {
    const variant = node?.variants?.nodes?.[0];
    const price = parseFloat(variant?.price?.amount || 0);
    const quantityAvailable = variant?.quantityAvailable;

    return variant?.id && price > 0 && quantityAvailable > 0;
  })
  .map(node => ({
    variant_id: node.variants.nodes[0].id.split('/').pop(),
    quantity: 1
  }));

    // Step 3: Build draft order input
    const draftOrderInput = {
      draft_order: {
        line_items: lineItems,
        customer: {
          email,
        },
        email,
        shipping_address: {
          address1,
          city,
          province,
          country,
          zip,
        },
        note,
        use_customer_default_address: false,
        tags: 'Created via Hydrogen custom checkout',
        shipping_line: {
          title: 'Standard Shipping',
          price: '0.00',
          code: 'Free Shipping',
        },
        send_invoice: true,
      },
    };

    // Step 4: Create draft order
    const createRes = await fetch(
      `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2023-04/draft_orders.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': context.env.PRIVATE_STOREFRONT_API_TOKEN,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(draftOrderInput),
      }
    );

    if (!createRes.ok) {
      const errText = await createRes.text();
      return json({ error: `Failed to create draft order: ${errText}` }, { status: 500 });
    }

    const { draft_order } = await createRes.json();

    // Step 5: Complete the draft order (optional)
    const completeRes = await fetch(
      `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2023-04/draft_orders/${draft_order.id}/complete.json`,
      {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': context.env.PRIVATE_STOREFRONT_API_TOKEN,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    if (!completeRes.ok) {
      const errText = await completeRes.text();
      return json({ error: `Failed to complete order: ${errText}` }, { status: 500 });
    }

    return json({
      // firstName,
      // lastName,
      email,
      address1,
      city,
      province,
      country,
      zip,
      note,
      wishData,
      productIds,
      storefrontRes,
      lineItems,
      draft_order
      // results
    });

  } catch (error) {
    console.error('Checkout action error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

export default function Checkout() {

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
        {/* <input required name="firstName" placeholder="First Name" className="p-2 border rounded m-2" />
        <input required name="lastName" placeholder="Last Name" className="p-2 border rounded m-2" /> */}
        {/* <input required type="email" name="email" placeholder="Email" className="p-2 border rounded m-2" /> */}
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