// app/routes/prac.jsx
import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';

export async function loader({context}) {
    const query = `
    query GetWelcomePage {
      metaobject(handle: {type: "welcomePageContent", handle: "welcome-to-my-store"}) {
        title: field(key: "title") {
          value
        }
        desc: field(key: "desc") {
          value
        }
      }
    }
  `;

  const {data} = await context.storefront.query(query);
  return json(data);
}

export default function WelcomePage() {
  const data = useLoaderData();
  const meta = data?.metaobject;
    console.log("Meta: ", data);

  if (!meta) return <div>Welcome page content not found.</div>;

  return (
    <section className="p-6 max-w-3xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">{meta.title?.value}</h1>
      <p className="text-lg">{meta.desc?.value}</p>
    </section>
  );
}
