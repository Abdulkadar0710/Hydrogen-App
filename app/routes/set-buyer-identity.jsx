// import {json} from '@shopify/remix-oxygen';

// export async function action({request, context}) {
//   const {cartId, countryCode} = await request.json();
// //   console.log('Setting buyer identity for cart:', cartId, 'with country code:', countryCode);

//   const mutation = `
//     mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
//       cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: {countryCode: $countryCode}) {
//         cart {
//           id
//           buyerIdentity {
//             countryCode
//           }
//         }
//         userErrors {
//           field
//           message
//         }
//       }
//     }
//   `; 

//   const {data, errors} = await context.storefront.query(mutation, {
//     variables: {cartId, countryCode},
//   });

//   if (errors || data.cartBuyerIdentityUpdate.userErrors.length) {
//     return json({error: 'Failed to update buyer identity'}, {status: 500});
//   }

//   return json({success: true});
// }
