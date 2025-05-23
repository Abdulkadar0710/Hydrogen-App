// app/routes/prac.jsx
import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';

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

export default function WelcomePage() {
  const data = useLoaderData();
  const meta = data?.metaobject;

  if (!meta) return <div>Welcome page content not found.</div>;

  return (
    <section className="p-6 max-w-3xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">{meta.title?.value}</h1>
      <p className="text-lg">{meta.desc?.value}</p>
      <img
          src={meta.welcomeImage.reference.image.url}
          alt={meta.welcomeImage.reference.image.altText || 'Welcome'}
          width={meta.welcomeImage.reference.image.width}
          height={meta.welcomeImage.reference.image.height}
          className="mx-auto rounded-lg shadow-lg"
        />
    </section>
  );
}
