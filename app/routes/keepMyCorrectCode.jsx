export async function action({ request, context }) {
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
  
      // Step 1: Load wishlist data from metafield API
      const wishRes = await fetch('http://localhost:3000/wish'); // change to your actual domain
      let wishRaw = await wishRes.json();
      const wishData = JSON.parse(wishRaw.customer?.metafield?.value) || [];
  
      // Step 2: Get variant IDs using Storefront API
      const productIds = wishData.map(p => p.id);
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
      const storefrontRes = await context.storefront.query(query, { variables });
  
      const lineItems = storefrontRes.nodes
        .filter(node => node?.variants?.nodes?.[0]?.id)
        .map(node => ({
          variant_id: node.variants.nodes[0].id.split('/').pop(),
          quantity: 1
        }));
  
      // Step 3: Build draft order input
      const draftOrderInput = {
        draft_order: {
          line_items: lineItems,
          customer: {
            first_name: firstName,
            last_name: lastName,
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
        `https://${process.env.SHOPIFY_DOMAIN}/admin/api/2023-04/draft_orders.json`,
        {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN,
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
        `https://${process.env.SHOPIFY_DOMAIN}/admin/api/2023-04/draft_orders/${draft_order.id}/complete.json`,
        {
          method: 'PUT',
          headers: {
            'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
  
      if (!completeRes.ok) {
        const errText = await completeRes.text();
        return json({ error: `Failed to complete order: ${errText}` }, { status: 500 });
      }
  
      return json({ success: true, orderId: draft_order.id });
    } catch (error) {
      console.error('Checkout action error:', error);
      return json({ error: 'Internal server error' }, { status: 500 });
    }
  }  