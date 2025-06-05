export async function loader({context}) {

    const response = await fetch('https://abdul-gwl.myshopify.com/admin/api/2024-01/graphql.json', {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': '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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              shop {
                name
                primaryDomain {
                  url
                }
              }
            }
          `,
        }),
      });
      
      const data = await response.json();
      
  return {data};
}