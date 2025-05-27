import { useState } from "react";
import { FaHeart } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";


  export default function AddToCart() {

   return (
    <div onClick={addToCart}>Add To Cart { isWishlisted ? <CiHeart /> : <FaHeart />}</div>
   )
  }