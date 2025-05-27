import { Form, json, Link, useLoaderData, useActionData } from '@remix-run/react';
import { redirect } from '@shopify/remix-oxygen';
import { useEffect } from 'react';

export async function loader({ context }) {
  const query = `
    query GetWelcomePage {
      metaobject(handle: {type: "welcomepage", handle: "i-am-title"}) {
        title: field(key: "welcometitle") {
          value
        }
        desc: field(key: "welcomedesc") {
          value
        }
        welcomeImage: field(key: "welcomeimage") {
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  `;
  const data = await context.storefront.query(query);
  return json(data);
}

export const action = async ({ request, context }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');

  const CUSTOMER_LOGIN_MUTATION = `#graphql
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          field
          message
        }
      }
    }
  `;

  const  data  = await context.storefront.mutate(CUSTOMER_LOGIN_MUTATION, {
    variables: {
      input: { email, password }, 
    },
  });

  const {customerAccessToken, customerUserErrors} = data?.customerAccessTokenCreate || {};
  console.log('Login data:', {email,password,customerAccessToken, customerUserErrors});

  if (customerUserErrors?.length){
    return json({ error: "Invalid" }, { status: 400 });
  }

  return json({ success: true, customerAccessToken }, { status: 200 });
};


export default function Login() {
  const data = useLoaderData();
  const actionData = useActionData();
  const meta = data?.metaobject;

  console.log("actionData: ", actionData);

  useEffect(()=>{
    localStorage.setItem('customerAccessToken', actionData?.customerAccessToken.accessToken);
  },[actionData]); 

  const { 
    title: { value: title } = {},
    desc: { value: desc } = {},
    welcomeImage: {
      reference: {
        image: {
          url,
          altText = 'Welcome',
          width,
          height,
        } = {},
      } = {},
    } = {},
  } = meta;

  if (!meta) return <div>Welcome page content not found.</div>;

  return (
    <div style={{ backgroundImage: `url(${url})` }} className="signup-container">
      <Form method="post" className="signup-form">
        <h2>{title}</h2>
        <h3 style={{ textAlign: 'center' }}>{desc}</h3>

        {actionData?.error && (
          <p style={{ color: 'red', textAlign: 'center' }}>{actionData.error}</p>
        )}

        <label>Email</label>
        <input type="email" name="email" required />

        <label>Password</label>
        <input type="password" name="password" required />

        <button type="submit">Login</button>
        <Link className="mov" to="/signup">
          signup
        </Link>
      </Form>
    </div>
  );
}
