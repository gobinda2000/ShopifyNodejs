// services/likeService.js
const fetch = require("node-fetch");
const { SHOPIFY_STORE, SHOPIFY_API_VERSION, SHOPIFY_ACCESS_TOKEN } = require("../config/shopify");

async function fetchArticleLikes(articleGID) {
  const query = `
    query GetArticleLikes($id: ID!) {
      article(id: $id) {
        likeCount: metafield(namespace: "custom", key: "like_count") { value }
        customerLikes: metafield(namespace: "custom", key: "customer_likes") { value }
      }
    }
  `;

  const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { id: articleGID } }),
  });

  return response.json();
}

async function updateArticleLikes(articleGID, newLikeCount, customerLikes) {
  const mutation = `
    mutation UpdateArticleLikes($ownerId: ID!, $likeCount: String!, $customerLikes: String!) {
      metafieldsSet(metafields: [
        {
          ownerId: $ownerId,
          namespace: "custom",
          key: "like_count",
          type: "number_integer",
          value: $likeCount
        },
        {
          ownerId: $ownerId,
          namespace: "custom",
          key: "customer_likes",
          type: "list.single_line_text_field",
          value: $customerLikes
        }
      ]) {
        metafields { id key value }
        userErrors { field message }
      }
    }
  `;

  const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        ownerId: articleGID,
        likeCount: String(newLikeCount),
        customerLikes: JSON.stringify(customerLikes),
      },
    }),
  });

  return response.json();
}

module.exports = { fetchArticleLikes, updateArticleLikes };
