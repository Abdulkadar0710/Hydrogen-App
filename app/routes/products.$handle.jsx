import {useLoaderData} from '@remix-run/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next'; 
import i18n from '~/i18n';


/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  const {context, request} = args;
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);
  
  
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


  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  //  console.log("Token: ",token);
  const params = new URLSearchParams(request.url);
  const customerAccess = params.get('customerAccessToken') || token;

  return {...deferredData, ...criticalData, customerId: response?.customer?.id || null, token: token || null,params: customerAccess, hii: "Hiii"}; 
}


/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const url = new URL(request.url);
  let language = url.searchParams.get('lang');
  

  let lang = 'en';
  let country = 'US';
  if (language === 'fr') {
    lang = 'FR';
    country = 'FR';
  } else if (language === 'hi') {
    lang = 'HI';
    country = 'IN';
  } else {
    lang = 'EN';
    country = 'US';
  }
  

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request),
        language: lang,
        country: country,
      }  
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);



  console.log("Product: ",product);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context, params}) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
} 


export default function Product() {
   
  const [flag, setFlag] = useState(true);

  /** @type {LoaderReturnData} */
  const {product} = useLoaderData();
  const [currentProduct, setCurrentProduct] = useState(product);
  // console.log("Current Product: ",currentProduct);

  const {customerId} = useLoaderData();

  const productToSave = {
    id: currentProduct.id,   
    title: currentProduct.title,
    vendor: currentProduct.vendor,  
    description: currentProduct.description,
    handle: currentProduct.handle,
    image: currentProduct.selectedOrFirstAvailableVariant.image.url,
    price: currentProduct.selectedOrFirstAvailableVariant.price.amount,
  };

  // console.log("Product to save: ",productToSave);
  // console.log("Product: ",product);
  const data = useLoaderData(); 
  // console.log("Data: ",data);

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  console.log("Title: ",title);
  console.log("Description HTML: ",descriptionHtml);

  const getProductId = (id) => {
    const productId = id.split('/').pop();
   //  console.log("Product ID: ", productId);
    return productId; 
   }

  useEffect(() => {
    
    const putLastViewed = async () => {
      const productId = getProductId(data.product.id);
      const updateLasrViewed = await fetch('/update-last-viewed', { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',  
        }, 
        body: JSON.stringify({productId: productId}),
      });

      const last = await updateLasrViewed.json(); 
      console.log("Last Viewed: ",last);
    }

      putLastViewed();

  }, []);



  useEffect(() => {
    const fetchWishList = async () => {
      try {
        const response = await fetch('/wish', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        let data = await response.json();
        // data =  data.customer?.metafield?.value ? JSON.parse(data.customer?.metafield?.value) : [];
  
        const foundItem = data.find((item) => item.id === product.id);
        setFlag(foundItem ? false : true);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    }; 
  
    fetchWishList();
  
    // If you had a cleanup, return it here:
    return () => {
      // any necessary cleanup (nothing in your case)
    };
  }, []);
  




  const addToCart = async () => {

    const response = await fetch('/wish', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'},
     });

    let data = await response.json();
    // data =  data ? JSON.parse(data) : [];

    // console.log("flag: ",flag); 
     if(flag){
       data.push(productToSave);
      //  console.log("Adding to wishlist", data);

      const updatedResponse = await fetch('/addToWishList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({wishlist: data, customerId: customerId}),
      });
      const updatedData = await updatedResponse.json();
      // console.log('updated Wishlist added one:', updatedData);
    }
      else{
        // console.log('Before Updated Wishlist:', data);
        // console.log("productToSave: ",productToSave);
        data = data.filter((item) => item.id !== productToSave.id);
        // console.log('Updated Wishlist:', data);
        const updatedResponse = await fetch('/addToWishList', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', 
          },
          body: JSON.stringify({wishlist: data, customerId: customerId}),
        });
        const updatedData = await updatedResponse.json();
        // console.log('updated Wishlist cutdown:', updatedData);
      }
      setFlag(!flag);
  };
  
  const { t } = useTranslation('common');


  return (
    <div className="product">
      <ProductImage image={selectedVariant?.image} />
      <div className="product-main">
        <h1>{title}</h1>
        <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
        />
        <br />
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />
        <div className="addToCart"
        onClick={addToCart}
        >{ flag==true ? <CiHeart /> : <FaHeart />}</div>
        <br />
        <br />
        <p>
          <strong>{t('Description')}</strong>
        </p>
        <br />
        <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
        <br />
      </div>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
