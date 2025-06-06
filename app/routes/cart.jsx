import {useLoaderData} from '@remix-run/react';
import {CartForm} from '@shopify/hydrogen';
import {data} from '@shopify/remix-oxygen';
import { useEffect } from 'react';
import {CartMain} from '~/components/CartMain';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: `Hydrogen | Cart`}];
};

/**
 * @type {HeadersFunction}
 */
export const headers = ({actionHeaders}) => actionHeaders;

/**
 * @param {ActionFunctionArgs}
 */
export async function action({request, context}) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = formDiscountCode ? [formDiscountCode] : [];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesUpdate: {
      const formGiftCardCode = inputs.giftCardCode;

      // User inputted gift card code
      const giftCardCodes = formGiftCardCode ? [formGiftCardCode] : [];

      // Combine gift card codes already applied on cart
      giftCardCodes.push(...inputs.giftCardCodes);

      result = await cart.updateGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  const {cart} = context;

  if (cart && cart.id) {
    const checkoutUrl = await cart.getCheckoutUrl();
    return { ...cart, checkoutUrl };
  }

  return await cart.get();
}

export default function Cart() {
  /** @type {LoaderReturnData} */
  const cart = useLoaderData();

  useEffect(() => {
    // Log cart data to console for debugging
    console.log('Cart loaded:', cart);
  }
  , [cart]);
  console.log('Cart data:', cart);



  function exportCartToCSV(cart) {
    if (!cart || !cart.lines || cart.lines.length === 0) {
      alert('Cart is empty or invalid.');
      return;
    }
  
    const headers = ['title', 'quantity'];
    const rows = cart.lines.nodes.map((line) => {
      const title = line.merchandise?.product?.title || '';
      const quantity = line.quantity || 0;
      return [title, quantity];
    });
  
    const csvContent = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');
  
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cart.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  



  return (
    <div className="cart">
      <h1>Cart</h1> 
      <button
       onClick={()=>exportCartToCSV(cart)}
       style={{
          backgroundColor: '#0070f3',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
       }}
      >Export to csv</button>
      <CartMain layout="page" cart={cart} />
    </div>
  );
}

/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/hydrogen').CartQueryDataReturn} CartQueryDataReturn */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').HeadersFunction} HeadersFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
