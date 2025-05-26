import { useState } from "react";
import { FaHeart } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";

// const [flag, setFlag] = useState(true);



  export default function AddToCart() {

    const [isWishlisted, setIsWishlisted] = useState(false);

    const addToCart = async () => {
      if (!isWishlisted) {
        const response = await fetch('/wish', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        const data = await response.json();
        const wishlist = JSON.parse(data.customer?.metafield?.value || '[]');
        wishlist.push({
          productId,
          title: 'New Wishlist Item',
        });
  
        console.log('Fetched Wishlist:', wishlist);
        setIsWishlisted(true);
      } else {
        console.log("Please wait before adding another item to the cart");
      }
    };
    
   return (
    <div onClick={addToCart}>Add To Cart { isWishlisted ? <CiHeart /> : <FaHeart />}</div>
   )
  }