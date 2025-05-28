import { useLoaderData, json } from '@remix-run/react';
import { useEffect } from 'react';

export async function loader() {
  return json({ message: 'Hello from Practice 2!' });
}

export default function Practice2() {
  const data = useLoaderData();

  useEffect(() => {
    console.log('Practice 2 data:', data);
  }, [data]);

  return (
    <section className="p-6 max-w-3xl mx-auto text-center">
      <h2>Practice 2</h2>
      <p>{data.message}</p>
    </section>
  );
}
