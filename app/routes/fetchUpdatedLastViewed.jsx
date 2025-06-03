import { json } from "@shopify/remix-oxygen";
export async function loader({context, request}){

    const accessToken = "5ccb00a6ce180d7b892f57cce0124e5d";

    const query = `
    query GetCustomerLastViewed($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        metafield(namespace: "custom", key: "last_viewed_products") {
          value
          type
          id
        }
      }
    }
  `;

  const { storefront } = context;

    const response = await storefront.query(query, {
      variables: {
        customerAccessToken: accessToken,
      },
    });

    const metafield = response.customer?.metafield?.value;
    const metaFieldArray = metafield.split(" ");
    console.log("Metafield Array: ", metaFieldArray);
    const removeColloan = metaFieldArray.map((id) => Number(id));

     const responseArray = [];
    for(let id in removeColloan){
        id = String(removeColloan[id]);
        // console.log("id: ",removeColloan[id]);
        const res = await fetch(`https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2024-04/products/${id}.json`, {
            method: 'GET',
            headers: {
              // 'Access-Control-Allow-Origin': allowedOrigin,
              // 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': context.env.PRIVATE_STOREFRONT_API_TOKEN, // Fix env reference
            },
          });

          let data = await res.json();
          const product = {
            id: data.product.id,
            title: data.product.title,
            handle: data.product.handle,
            description: data.product.body_html,
            image: data.product.images[0] ? data.product.images[0].src : null,
            price: data.product.variants[0] ? data.product.variants[0].price : null,
            availableForSale: data.product.variants[0] ? data.product.variants[0].available : false,
          };

          responseArray.push(product);
    }


    

    return json({responseArray}, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Content-Type': 'application/json',
        }
       })
}