import { json } from '@shopify/remix-oxygen';

export async function loader({ context, request }) {  
  const url = new URL(request.url);
  // TODO: Replace with dynamic customer access token retrieval
  const customerAccessToken = '5ccb00a6ce180d7b892f57cce0124e5d'; 

  if (!customerAccessToken) {
    return json({ error: 'Missing customer access token' }, { status: 401 }); // 401 for unauthorized
  }

  const QUERY = `#graphql
    query GetCustomerWishlist($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        metafield(namespace: "custom", key: "wishl") {
          value 
        }
      }
    }
  `;  

  const response = await context.storefront.query(QUERY, { 
    variables: { customerAccessToken },
  });



  const PRODUCT_QUERY = `#graphql
  query GetProducts($ids: [ID!]!, $language: LanguageCode, $country: CountryCode) 
  @inContext(language: $language, country: $country) { 
    nodes(ids: $ids) { 
      ... on Product { 
        id
        title
        description
        handle
        vendor
        images(first: 1) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;


const wishlistIds = response?.customer?.metafield?.value
    ? JSON.parse(response.customer.metafield.value)
    : [];

    const ids = wishlistIds.map((item) => item.id);


    const language = url.searchParams.get('lang');
    console.log("Language: ", language);

    let lang = 'en';
    let country = 'US';
    if (language === 'fr') {
      lang = 'FR';
      country = 'FR';
    } else if (language === 'hi') {
      lang = 'HI';
      country = 'IN';
    } else {
      lang = 'EN';
      country = 'US';
    }

    const productResponse = await context.storefront.query(PRODUCT_QUERY, {
      variables: {
        ids,
        language: lang,
        country: country
      },
    });



  // const parsedWishlist = response?.customer?.metafield?.value
  //   ? JSON.parse(response.customer.metafield.value)
  //   : [];

  //if anything wrong happens return response and remove .parse lines that are commented in fetch('/wish') 2 times in wishlist.jsx
  // product.$handel.jsx and productDetails.jsx

  const productData = productResponse.nodes.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      handle: product.handle,
      vendor: product.vendor,
      image:  product.images?.edges[0]?.node?.url,
    
      price: product.variants?.edges[0]?.node?.price.amount || '0.00'
  }));

  return json(productData);
}
 