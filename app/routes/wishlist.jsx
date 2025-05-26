// // app/routes/wishlist.jsx
// import { json } from '@shopify/remix-oxygen';
// import { useLoaderData } from '@remix-run/react';

// export async function loader({ context }) {
//   const { storefront } = context;

//   const accessToken = 'bc33a8c808ee39da2b461f93e132fd32'; // Ideally from session or secure source

//   const query = `
//     query GetWishlist($customerAccessToken: String!) {
//       customer(customerAccessToken: $customerAccessToken) {
//         metafield(namespace: "custom", key: "wishl") {
//           value
//         }
//       }
//     }
//   `;

//   try {
//     const data = await storefront.query(query, {
//       variables: { customerAccessToken: accessToken },
//     });

//     const rawValue = data?.customer?.metafield?.value;
//     const wishlist = rawValue ? JSON.parse(rawValue) : [];

//     return json({ wishlist });
//   } catch (error) {
//     console.error('Error fetching wishlist:', error);
//     throw new Response('Failed to fetch wishlist', { status: 500 });
//   }
// }

// export default function WishList() {
//   const { wishlist } = useLoaderData();

//   return (
//     <div className="wishlist">
//       <h1>My Wishlist</h1>

//       {wishlist.length === 0 ? (
//         <p>Your wishlist is empty.</p>
//       ) : (
//         <ul>
//           {wishlist.map((item, index) => (
//             <li key={index}>{item}</li> // Customize this as needed
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
