import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense, useEffect} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {useNavigate} from '@remix-run/react';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

/**
 * @param {LoaderFunctionArgs} args 
 */ 
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);
   
  const val = await loadAllCollectionsData(args);
  // console.log("Val: ", val); 

  return {...deferredData, ...criticalData, ...val};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);
 
  return { 
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      // console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

 



async function loadAllCollectionsData({context}) {
  try {
    const response =  await context.storefront.query(ALL_COLLECTIONS_QUERY);
    // console.log("A: ",response);
    return {
      allCollections: response,   
    }; 
  } catch (error) { 
    console.error("Error loading all collections:", error);
    return {
      allCollections: null,
    }; 
  }
}


export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();


  const navigate = useNavigate();

  useEffect(()=>{
    const token = localStorage.getItem('token');
    if(token){
      console.log("Token: ", token);
    }
    else{
      // navigate('/signup'); 
    }
  },[])
 
  // console.log("Datas: ",data);
  return (
    <div className="home">
      <Banner/>
      <AllCollectionsQuery collections={data.allCollections} />
      {/* <FeaturedCollection collection={data.featuredCollection} /> */}
      {/* <RecommendedProducts products={data.recommendedProducts} /> */}
    </div>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({collection}) {
  // console.log("Collection: ", collection);
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}



/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({products}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products by ak</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

function AllCollectionsQuery({collections}) {

  // console.log("all: ",collections);
  if (!collections || !collections.collections) return null;

  return (
    <div className="recommended-products"> 
      <h2>All Collections by AK</h2> <br />
      <div className="recommended-products-grid">
        {collections.collections.nodes.map((collection) => (
          <Link key={collection.id} to={`/collections/${collection.handle}`}>
            <div className="collection-card">
              {collection.image && (
                <Image data={collection.image} alt={collection.title} />
              )}
              <h3>{collection.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;





const ALL_COLLECTIONS_QUERY = `#graphql
  fragment CollectionDetails on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }

  query AllCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 5, sortKey: TITLE) {
      nodes {
        ...CollectionDetails
      }
    }
  }
`;


/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */



function Banner() {
  // console.log("Banner component loaded sucessfully ");
  return (
    <section className="banner">
     <div className="banner-info">
      <h1>Style That Speaks for You</h1>
      <p>Discover timeless fashion and everyday essentials with a modern edge. From casual tees to standout pieces, find your perfect look in our latest collection.</p>
     </div>       
    </section>
  );
}
