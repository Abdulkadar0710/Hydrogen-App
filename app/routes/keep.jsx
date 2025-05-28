import {useLoaderData, useFetcher, useNavigate} from '@remix-run/react';
import {json, redirect} from '@shopify/remix-oxygen';
import React from 'react';
 
const SHOPIFY_DOMAIN = 'prarthna-gwl.myshopify.com'; // Replace with your shop domain
const SHOPIFY_ACCESS_TOKEN = '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'; // Replace with your access token
 
export async function loader({context}) {
  const cart = await context.cart.get(); 
  const cartId = cart?.id;
  const {storefront} = context;
 
  if (!cartId) {
    throw new Response('Cart not found', {status: 404});
  }
 
  const data = await storefront.query(
    `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                  }
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
        estimatedCost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  `,
    {variables: {cartId}}
  );
 
  if (!data?.cart) {
    throw new Response('Cart not found', {status: 404});
  }
 
  return json(data.cart);
}
 
export async function action({request}) {
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
    const cartLinesJSON = form.get('cartLines');
 
    if (
      !firstName || !lastName || !email || !address1 ||
      !city || !province || !country || !zip || !cartLinesJSON
    ) {
      return json({error: 'Please fill all required fields'}, {status: 400});
    }
 
    const cartLines = JSON.parse(cartLinesJSON);
    const lineItems = cartLines.map((line) => ({
      variant_id: line.variantId.split('/').pop(),
      quantity: Number(line.quantity) >= 1 ? Number(line.quantity) : 1, // Ensure qty ≥ 1
    }));
 
    const draftOrderInput = {
      draft_order: {
        line_items: lineItems,
        customer: {
          first_name: firstName,
          last_name: lastName,
          email,            // customer email here
        },
        email,              // top-level email required for order to have email
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
        send_invoice: true,  // send email invoice automatically
      },
    };
 
    // Create draft order
    const createRes = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/2023-04/draft_orders.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(draftOrderInput),
      }
    );
 
    if (!createRes.ok) {
      const errText = await createRes.text();
      return json({error: `Failed to create draft order: ${errText}`}, {status: 500});
    }
 
    const {draft_order} = await createRes.json();
 
    // Complete draft order to convert to actual order & charge
    const completeRes = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/2023-04/draft_orders/${draft_order.id}/complete.json`,
      {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );
 
    if (!completeRes.ok) {
      const errText = await completeRes.text();
      return json({error: `Failed to complete order: ${errText}`}, {status: 500});
    }
 
    // Success — redirect to homepage or wherever you want
    return redirect('/');
  } catch (error) {
    console.error('Checkout action error:', error);
    return json({error: 'Internal server error'}, {status: 500});
  }
}
 
export default function Checkout() {
  const cart = useLoaderData();
  const fetcher = useFetcher();
  const error = fetcher.data?.error;
 
  const cartLines = cart.lines.edges.map(({node}) => ({
    id: node.id,
    variantId: node.merchandise.id,
    productTitle: node.merchandise.product.title,
    variantTitle: node.merchandise.title,
    quantity: node.quantity,
    price: node.merchandise.price.amount,
    currency: node.merchandise.price.currencyCode,
  }));
 
  return (
    <main className="max-w-lg mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Custom Checkout (No Payment)</h1>
 
      {error && <p className="mb-4 text-red-600">{error}</p>}
 
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
        <ul className="border p-4 rounded">
          {cartLines.map((line) => (
            <li key={line.id} className="flex justify-between mb-2">
              <span>
                {line.productTitle} - {line.variantTitle} x {line.quantity}
              </span>
              <span>
                {line.currency} {(line.price * line.quantity).toFixed(2)}
              </span>
            </li>
          ))}
          <li className="flex justify-between font-bold border-t pt-2">
            <span>Total:</span>
            <span>
              {cart.estimatedCost.totalAmount.currencyCode}{' '}
              {parseFloat(cart.estimatedCost.totalAmount.amount).toFixed(2)}
            </span>
          </li>
        </ul>
      </section>
 
      <fetcher.Form method="post">
        <input
          type="hidden"
          name="cartLines"
          value={JSON.stringify(
            cartLines.map((line) => ({
              variantId: line.variantId,
              quantity: line.quantity,
            }))
          )}
        />
 
        <input required name="firstName" placeholder="First Name" className="w-full p-2 border rounded mb-2" />
        <input required name="lastName" placeholder="Last Name" className="w-full p-2 border rounded mb-2" />
        <input required type="email" name="email" placeholder="Email" className="w-full p-2 border rounded mb-2" />
        <input required name="address1" placeholder="Address" className="w-full p-2 border rounded mb-2" />
        <input required name="city" placeholder="City" className="w-full p-2 border rounded mb-2" />
        <input required name="province" placeholder="State/Province" className="w-full p-2 border rounded mb-2" />
        <input required name="country" placeholder="Country" className="w-full p-2 border rounded mb-2" />
        <input required name="zip" placeholder="Zip/Postal Code" className="w-full p-2 border rounded mb-2" />
        <textarea name="note" placeholder="Order notes (optional)" className="w-full p-2 border rounded mb-4" rows={3} />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Place Order
        </button>
      </fetcher.Form>
    </main>
  );
}