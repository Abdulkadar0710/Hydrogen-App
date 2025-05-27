import { useLoaderData } from '@remix-run/react';
import { json } from '@shopify/remix-oxygen';
import { useEffect, useState } from 'react';

// export async function loader({ context }) {
//   const customerAccessToken = 'b6c74bd7c44c237f5b38471dffcf16d6';

//   if (!customerAccessToken) {
//     console.warn('No customer access token found. Returning empty wishlist.');
//     return json({ wishlist: [] });
//   }

//   const query = `#graphql
//   query GetCustomerWishlist($customerAccessToken: String!) {
//     customer(customerAccessToken: $customerAccessToken) {
//       id
//       email
//       firstName
//       lastName
//       metafield(namespace: "custom", key: "wishl") {
//         value 
//       }
//     }
//   }
// `;

//     const response = await context.storefront.query(query, {
//       variables: { customerAccessToken },
//     });

//     const parsedWishlist = response?.customer?.metafield?.value
//       ? JSON.parse(response.customer.metafield.value)
//       : [];
//     console.log("Parsed Wishlist:", parsedWishlist);
//     return json(response);
// }



export default function WishList() {
  // const  wishlist  = useLoaderData();

  const [wishlist, setWishlist] = useState([]);

  const fetchWishList = async () => {
    const response = await fetch('/wish', { // Changed from './api/wish'
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'},
    });
    let data = await response.json();
    data = JSON.parse(data.customer?.metafield?.value) || [];
    setWishlist(data || []);
    console.log('Fetched Wishlist:', data);
  };


  useEffect(() => {
    fetchWishList();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Wishlist</h2>
      {
        wishlist.length > 0 ? (
          <ul>
            {wishlist.map((item) => (
              <li key={item.id}>
             <div className="">{item.title}</div>
               <div>{item.description}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Your wishlist is empty.</p>
        )
      }
    </div>
  );
}
