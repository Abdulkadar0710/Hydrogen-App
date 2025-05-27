// import { useEffect } from "react";
// import { useFetcher } from "@remix-run/react";

// export default function WishlistComponent() {
//   const fetcher = useFetcher();

//   useEffect(() => {
//     document.cookie = `token=${token}; path=/`;
//   }, []);
 
//   return (
//     <div>
//       {fetcher.data?.wishlist && (
//         <pre>{JSON.stringify(fetcher.data.wishlist, null, 2)}</pre>
//       )}
//     </div>
//   );
// }
