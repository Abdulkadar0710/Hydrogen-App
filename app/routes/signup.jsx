import { Form, json, Link, useLoaderData } from '@remix-run/react';

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

  const data = await context.storefront.query(query);
  return json(data);
}

export const action = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');


  return json({ success: true });
};

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