import {Suspense, useEffect, useState} from 'react';
import {Await, NavLink, useAsyncValue} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import { useRouteLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

/**
 * @param {HeaderProps}
 */



export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;

  const dd = useRouteLoaderData('root');
  return (
    <header className="header">
      <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
        <strong>{shop.name}</strong>
      </NavLink>
      <HeaderMenu
        menu={menu} 
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();
  const {t} = useTranslation('common');

  const FALLBACK_HEADER_MENU = {
    id: 'gid://shopify/Menu/199655587896',
    items: [
      {
        id: 'gid://shopify/MenuItem/461609500728',
        resourceId: null,
        tags: [],
        title: t('Home'),
        type: 'HTTP',
        url: '/',
        items: [],
      },
      {
        id: 'gid://shopify/MenuItem/46160950072811111',
        resourceId: null,
        tags: [],
        title: t('Collections'),
        type: 'HTTP',
        url: '/collections',
        items: [],
      },
      {
        id: 'gid://shopify/MenuItem/46160953349611111',
        resourceId: null,
        tags: [],
        title: t('wishList'),
        type: 'HTTP',
        url: '/Wishlist',
        items: [],
      },
      {
        id: 'gid://shopify/MenuItem/4616095334911111',
        resourceId: null,
        tags: [],
        title: t('Checkout'),
        type: 'HTTP',
        url: '/checkout',
        items: [],
      }
      // {
      //   id: 'gid://shopify/MenuItem/461609566264',
      //   resourceId: null,
      //   tags: [],
      //   title: 'Policies',
      //   type: 'HTTP',
      //   url: '/policies',
      //   items: [],
      // },
      // {
      //   id: 'gid://shopify/MenuItem/461609599032',
      //   resourceId: 'gid://shopify/Page/92591030328',
      //   tags: [],
      //   title: 'About',
      //   type: 'PAGE',
      //   url: '/pages/about',
      //   items: [],
      // },
    ],
  };

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          {t('Home')}
        </NavLink>
      )}
      {(FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {

  const rootData =  useRouteLoaderData('root');
  // console.log('AddToCart fg rootData:', rootData);

  const {t} = useTranslation('common');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [customerAccessToken, setCustomerAccessToken] = useState('');
  useEffect(() => {
    if (rootData?.customerAccessToken?.customer) {
      const customer = rootData.customerAccessToken.customer;
      setFirstName(customer.firstName);
      setLastName(customer.lastName);
      setEmail(customer.email);
      const token = typeof window !== 'undefined' ? localStorage.getItem('customerAccessToken') : null;
      if (token!== null || token !== 'undefined') {
        setCustomerAccessToken(token); 
        // console.log('AddToCart fg customerAccessToken:', rootData);
      }
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
    }
  }, [rootData]);

  // const firstName = rootData?.customerAccessToken?.customer?.firstName || 'Guest';
  // const lastName = rootData?.customerAccessToken?.customer?.lastName || '';
  // const fullName = `${firstName} ${lastName}`.trim() || 'Guest';
  // console.log('AddToCart fg fullName:', fullName);
  // const email = rootData?.customerAccessToken?.customer?.email || 'email';
  // console.log('AddToCart fg email:', email);

  // console.log('AddToCart fg customerAccessToken:', customerAccessToken);
  return (
    <nav className="header-ctas" role="navigation">
      {/* <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            df {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign inn')}
          </Await>
        </Suspense>
      </NavLink> */}
      {
        customerAccessToken ? (
          <NavLink prefetch="intent" to='/' style={activeLinkStyle}
          //  onClick={() => {
          //   // console.log('User clicked on account link');
          //   const isTrue = console.prompt("Are you sure you want to logout? (yes/no)");
          //   console.log('User confirmed logout:', isTrue);
          //   const token = typeof window !== 'undefined' ? localStorage.getItem('customerAccessToken') : null;
          //   // You can add any additional logic here, like tracking the click
          //   if(token){
          //     localStorage.removeItem('customerAccessToken');
              
          //   }
          // }
          // }
          >
            {firstName} {lastName}
          </NavLink>
        ) : (
          <NavLink prefetch="intent" to="/" style={activeLinkStyle}>
            {t('Sign in')}
          </NavLink>
        )
        
      } 
      <div 
       onClick={() => {
        console.log('User clicked on logout link');
        localStorage.removeItem('customerAccessToken');
        setFirstName('');
        setLastName('');
        setEmail('');
        setCustomerAccessToken('');
        }
       }
      >
      { (email) ? t('LogOut') : '' }
      </div>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
 
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  const {t} = useTranslation('common');
  return (
    <button className="reset" onClick={() => open('search')}>
      {t('Search')}
    </button>
  );
}

/**
 * @param {{count: number | null}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      Cart {count === null ? <span>&nbsp;</span> : count}
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}





/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
