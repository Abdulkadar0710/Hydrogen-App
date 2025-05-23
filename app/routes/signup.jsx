import { Form, json, Link, useLoaderData } from '@remix-run/react';
import {redirect} from '@shopify/remix-oxygen';
import {useNavigate} from '@remix-run/react';
export async function loader({context}) {
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

//   const CREATE_CUSTOMER_MUTATION = `#graphql
//   mutation customerCreate($input: CustomerCreateInput!) {
//     customerCreate(input: $input) {
//       customer {
//         id
//         email
//       }
//       customerUserErrors {
//         field
//         message
//       }
//     }
//   }
// `;

// const input = {
//   firstName: "kadar",
//     lastName: "khan",
//     email: "abdulkadar0710@gmail.com",
//     password: "abc@12345678"
// };

// const { data } = await context.storefront.mutate(CREATE_CUSTOMER_MUTATION, {
//   variables: { input },
// });

// const errors = data?.customerCreate?.customerUserErrors;
// if (errors?.length) {
//   return json({ error: errors[0].message }, { status: 400 }); 
// }

  const data = await context.storefront.query(query);
  return json(data);
}



export const action = async ({ request, context }) => {
  const formData = await request.formData();
  const input = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    password: formData.get('password'),
  }; 

  const CREATE_CUSTOMER_MUTATION = `#graphql
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
        }
        customerUserErrors {
          field
          message
        }
      }
    }
  `;

  const  val = await context.storefront.mutate(CREATE_CUSTOMER_MUTATION, {
    variables: { input },
  });


  const { data } = val;

  const errors = data?.customerCreate?.customerUserErrors;
  if (errors?.length) {
    return json({ error: errors[0].message }, { status: 400 });
  }
  

  if(!errors?.length) {
    const formData = new FormData();
    formData.set('firstName', '');  
    formData.set('lastName', '');
    formData.set('email', '');
    formData.set('password', '');
 
  }

   return redirect('/');
};

// export const action = async ({ request }) => {
//   const formData = await request.formData();
//   const email = formData.get('email'); 
//   const password = formData.get('password'); 


//   return json({ success: true });
// };

export default function Signup() {

      const data = useLoaderData();
      const meta = data?.metaobject;
      const {
        title: {value: title} = {},
        desc: {value: desc} = {}, 
        welcomeImage: {
          reference: {
            image: {
              url,
              altText = 'Welcome',
              width,
              height
            } = {}
          } = {}
        } = {}
      } = meta;
    
  
    if (!meta) return <div>Welcome page content not found.</div>;

  return (
    <div className="signup-container" style={{ backgroundImage: `url(${url})` }}> 
      <Form method="post" className="signup-form">
        <h2>{title}</h2>
        <h3 style={{textAlign: "center"}}>{desc}</h3>

        <label>firstName</label> 
        <input type="text" name="firstName" required /> 

        <label>lastName</label> 
        <input type="text" name="lastName" required /> 

        <label>Email</label> 
        <input type="email" name="email" required /> 

        <label>Password</label> 
        <input type="password" name="password" required />

        <button type="submit">SignUp</button>
        <Link className="mov" to="/login" >Login</Link>
      </Form> 
    </div>
  ); 
}