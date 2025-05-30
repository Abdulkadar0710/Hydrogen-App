
import { useLoaderData, Link } from '@remix-run/react';
import { json } from '@shopify/remix-oxygen';

import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { useEffect, useState } from 'react';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';


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

  const cart = await context.cart.get();
 
  const response = await context.storefront.query(query, {variables});
  // console.log("Context: ", context);
  return json({customerId: response?.customer?.id, contextCart: cart});

}



export default function WishList() {

  const {customerId}  = useLoaderData();
  const {contextCart} = useLoaderData();
  // console.log("contextCart in WishList: ", contextCart);
  const {open} = useAside();
  
  useEffect(() =>  { 
    setTimeout(() => {
      
      // console.log("Customer ID: ", customerId);
    }, 3000);
  },[customerId])


  const [wishlist, setWishlist] = useState([]);
  const [otherWishList, setOtherWishList] = useState([]);
  const [flag, setFlag] = useState(true);
  const [wishIds, setWishIds] = useState([]);
 
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
  },[])  

  // useEffect(() => {
  
  //   let arr = [];
  //   console.log("Wishlist: ", wishlist);

  //   if(wishlist.length > 0) {
  //   wishlist.forEach((item) => {
  //     const id = getProductId(item.id);
  //     const fetchProduct = async () => {
  //       const res = await fetch(`/fetchProductsInfoById?id=${id}`, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'X-Shopify-Access-Token': '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', // Fix env reference
  //         },
  //       });

  //       const data = await res.json();
  //       return data; 
  //     }
      
  //     fetchProduct().then((productData) => {
  //       console.log("Product Data in AddToCartButton: ", productData);
  //        arr.push(productData);
  //     }).catch
  //     ((error) => {
  //       console.error("Error fetching product data: ", error);
  //     });
  //   })  
  //   }

  //   console.log("Wishlist IDs: ", arr);

  // },[wishlist])  


  const fetchWishList = async () => {
    const response = await fetch('/wish', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'},
    });
    let data = await response.json();
    data = JSON.parse(data.customer?.metafield?.value) || [];
    setWishlist(data || []);
    // console.log('Fetched Wishlist:', data);
  };

  const removeFronCart = async (id) => { 

    // console.log("Removing item with ID:", id);
    // console.log("Wishlist before removal:", wishlist);
   
    const updatedWishlist = wishlist.filter(item => item.id !== id);
    // console.log("Wishlist After removal:", updatedWishlist);

        const updatedResponse = await fetch('/addToWishList', { 
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json',  
          }, 
          body: JSON.stringify({wishlist: updatedWishlist, customerId: customerId}),
        });
        const updatedData = await updatedResponse.json();

        // console.log("updatedData:", updatedData);


    setWishlist(updatedWishlist);

  }
  
 
  useEffect(() => {
    fetchWishList();
  }, []);


const fetchDataFromUrl = async () => {
  const res = await fetch(`/fetchProductsInfoById?id=8649199812836`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': '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', // Fix env reference
    }, 
  });

  const data = await res.json();
  setOtherWishList(data);
  return data;
}

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchDataFromUrl();
        // console.log("Fetched Data: ", data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } 
    }; 

    fetchData();
  }
  , []);



  const getProductId = (id) => {
   const productId = id.split('/').pop();
  //  console.log("Product ID: ", productId);
   return productId;
  }

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
               <div>{item.price}</div>
               <Link to={`/products/${item.handle}`} className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                View Product
               </Link>
               <div className="lhParent" onClick={()=>removeFronCart(item.id)}>{ flag ? <FaHeart/> : <CiHeart/>}</div>
               </div>
               </div>
              </li>
            ))}
          <Link style={{color: "white"}} to="/checkout" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Proceed to Checkout
          </Link>  
          </ul>
          
          
        ) : (
          <p>Your wishlist is empty.</p>
        )
      }
    </div>
  );
}
