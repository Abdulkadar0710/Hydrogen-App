import { useEffect } from "react";

export default function Func() {

    const getProductDetails = async() => {
        const response = await fetch('/fetchProductsInfoById', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: '8068214227172', // Replace with the actual product ID you want to fetch
            }),
        });

        const data = await response.json();
        return data;
    }

    useEffect(() => {
        getProductDetails().then(data => {
            console.log("Product Details: ", data);
        }).catch(error => {
            console.error("Error fetching product details: ", error);
        });
    }, []);

    return (
        <div>
            <h1>Function Route</h1>
            <p>This is a placeholder for a function route.</p>
            <p>
               
            </p>
        </div>
    );
}