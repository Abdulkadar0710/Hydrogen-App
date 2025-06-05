// import { json } from '@shopify/remix-oxygen';

// export async function loader({ context, request }) {  
//   const url = new URL(request.url);
//   // TODO: Replace with dynamic customer access token retrieval
//   const customerAccessToken = '5ccb00a6ce180d7b892f57cce0124e5d'; 

//   if (!customerAccessToken) {
//     return json({ error: 'Missing customer access token' }, { status: 401 }); // 401 for unauthorized
//   }

//   // Set French context
//   context.storefront.i18n = {
//     language: 'FR',
//     country: 'FR', // Changed to FR for France
//   };

//   console.log("Context Storefront:", context.storefront.i18n);

//   // First, get the wishlist metafield
//   const QUERY = `#graphql
//     query GetCustomerWishlist($customerAccessToken: String!) {
//       customer(customerAccessToken: $customerAccessToken) {
//         metafield(namespace: "custom", key: "wishl") {
//           value
//         }
//       }
//     }
//   `;  

//   const response = await context.storefront.query(QUERY, { 
//     variables: { customerAccessToken },
//     language: context.storefront.i18n.language,
//     country: context.storefront.i18n.country,
//   });

//   const parsedWishlist = response?.customer?.metafield?.value
//     ? JSON.parse(response.customer.metafield.value)
//     : [];

//   console.log("Parsed Wishlist:", parsedWishlist);

//   // If wishlist has items, fetch product details in French
//   if (parsedWishlist.length > 0) {
//     // Extract product IDs from wishlist
//     const productIds = parsedWishlist.map(item => {
//       if (typeof item === 'object' && item.id) {
//         return item.id.includes('gid://') ? item.id : `gid://shopify/Product/${item.id}`;
//       }
//       return `gid://shopify/Product/${item}`;
//     });

//     const PRODUCTS_QUERY = `#graphql
//       query GetWishlistProducts($ids: [ID!]!, $language: LanguageCode!) @inContext(language: $language) {
//         nodes(ids: $ids) {
//           ... on Product {
//             id
//             title
//             description
//             handle
//             vendor
//             featuredImage {
//               url
//               altText
//             }
//             priceRange {
//               minVariantPrice {
//                 amount
//                 currencyCode
//               }
//               maxVariantPrice {
//                 amount
//                 currencyCode
//               }
//             }
//             variants(first: 5) {
//               nodes {
//                 id
//                 title
//                 price {
//                   amount
//                   currencyCode
//                 }
//                 image {
//                   url
//                   altText
//                 }
//               }
//             }
//           }
//         }
//       }
//     `;

//     const productsResponse = await context.storefront.query(PRODUCTS_QUERY, {
//       variables: {
//         ids: productIds,
//         language: 'FR'
//       }
//     });

//     console.log("Products in French:", productsResponse.nodes);

//     return json({
//       customer: response.customer,
//       wishlist: parsedWishlist,
//       products: productsResponse.nodes || [],
//       language: context.storefront.i18n.language
//     });
//   }

//   return json({
//     customer: response.customer,
//     wishlist: parsedWishlist,
//     products: [],
//     language: context.storefront.i18n.language
//   });
// }