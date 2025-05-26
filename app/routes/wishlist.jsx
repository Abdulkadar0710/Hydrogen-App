import { useLoaderData } from '@remix-run/react';
import { json } from '@shopify/remix-oxygen';

export async function loader({ context }) {
  const customerAccessToken = 'b6c74bd7c44c237f5b38471dffcf16d6';

  if (!customerAccessToken) {
    console.warn('No customer access token found. Returning empty wishlist.');
    return json({ wishlist: [] });
  }

  const query = `#graphql
  query GetCustomerWishlist($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
      metafield(namespace: "custom", key: "wishl") {
        value 
      }
    }
  }
`;

    const response = await context.storefront.query(query, {
      variables: { customerAccessToken },
    });

    const parsedWishlist = response?.customer?.metafield?.value
      ? JSON.parse(response.customer.metafield.value)
      : [];
    console.log("Parsed Wishlist:", parsedWishlist);
    return json(response);
}

export default function WishList() {
  const  wishlist  = useLoaderData();
  console.log("Wishlist Data:", wishlist);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Wishlist</h2>
      {/* {wishlist.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        <ul>
          {wishlist.map((item, index) => (
            <li key={index} className="mb-2">
              {item.title} <br />
              <small className="text-sm text-gray-500">{item.productId}</small>
            </li>
          ))}
        </ul>
      )} */}
    </div>
  );
}
