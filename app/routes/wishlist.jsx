// saved data
// [
//   {
//     "id": "gid://shopify/Product/111",
//     "title": "Cool Shirt",
//     "vendor": "Nike",
//     "description": "A cool shirt",
//     "handle": "cool-shirt"
//   },
//   {
//     "id": "gid://shopify/Product/8649204596964",
//     "title": "pants",
//     "vendor": "Abdul-gwl",
//     "description": "ragzo formal pants",
//     "handle": "pants-2"
//   },
//   {
//     "id": "gid://shopify/Product/8649202270436",
//     "title": "tshirt",
//     "vendor": "Abdul-gwl",
//     "description": "full sleves tshirt.",
//     "handle": "tshirt-3"
//   },
//   {
//     "id": "gid://shopify/Product/8649201713380",
//     "title": "tshirt",
//     "vendor": "Abdul-gwl",
//     "description": "cotton printed tshirt",
//     "handle": "tshirt-2"
//   }
// ]

import { useLoaderData } from '@remix-run/react';
import { json } from '@shopify/remix-oxygen';

import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
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

export async function loader({ context, request }) {

    const customerAccessToken = '5ccb00a6ce180d7b892f57cce0124e5d';

    
  const query = `
    query GetCustomerId($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id  
      }
    }
  `;

  const variables = {
    customerAccessToken,
  };
 
  const response = await context.storefront.query(query, {variables});

  return json({customerId: response?.customer?.id});

}



export default function WishList() {

  const {customerId}  = useLoaderData();
  
  useEffect(() =>  { 
    setTimeout(() => {
      
      console.log("Customer ID: ", customerId);
    }, 3000);
  },[customerId])


  const [wishlist, setWishlist] = useState([]);
  const [flag, setFlag] = useState(true);
 
  const loadWishList = async () => {         
    const response = await fetch('/wish', {
      method: 'GET', 
      headers: {
        'Content-Type': 'application/json'},
     });

    let data = await response.json();
    data = JSON.parse(data.customer?.metafield?.value) || [];

    return data;
  }

  useEffect(()=>{
    const data = loadWishList();
    setWishlist(data || []);
    // console.log("Data: ", data); 
  },[])  


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

  const removeFronCart = async (id) => { 

    console.log("Removing item with ID:", id);
    console.log("Wishlist before removal:", wishlist);
   
    const updatedWishlist = wishlist.filter(item => item.id !== id);
    console.log("Wishlist After removal:", updatedWishlist);

        const updatedResponse = await fetch('/addToWishList', { 
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json',  
          }, 
          body: JSON.stringify({wishlist: updatedWishlist, customerId: customerId}),
        });
        const updatedData = await updatedResponse.json();

        console.log("updatedData:", updatedData); 


    setWishlist(updatedWishlist);

  }
  
 
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
               <div className="box flex ">
               <img src={item.image} alt={item.title} className="w-50 h-50 object-cover" />
               <div className="textBox flex flex-col justify-center ml-4">
               <div className="">{item.title}</div>
               <div>{item.description}</div>
               <div className="lhParent" onClick={()=>removeFronCart(item.id)}>{ flag ? <FaHeart/> : <CiHeart/>}</div>
               </div>
               </div>
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
