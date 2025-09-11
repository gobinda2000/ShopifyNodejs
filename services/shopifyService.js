const fetch = require("node-fetch");
const { SHOPIFY_STORE, SHOPIFY_API_VERSION, SHOPIFY_ACCESS_TOKEN } = require("../config/shopify");

async function shopifyGraphQL(query, variables = {}) {
  const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(JSON.stringify(result.errors, null, 2));
  }
  return result.data;
}

module.exports = { shopifyGraphQL };
