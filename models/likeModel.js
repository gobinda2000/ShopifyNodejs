const fetch = require("node-fetch");

class LikeModel {
  constructor(store, apiVersion, accessToken) {
    this.store = store;
    this.apiVersion = apiVersion;
    this.accessToken = accessToken;
  }

  async fetchArticleMetafields(articleId) {
    const query = `
      query GetArticleLikes($id: ID!) {
        article(id: $id) {
          likeCount: metafield(namespace: "custom", key: "like_count") {
            value
          }
          customerLikes: metafield(namespace: "custom", key: "customer_likes") {
            value
          }
        }
      }
    `;

    const response = await fetch(`https://${this.store}/admin/api/${this.apiVersion}/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": this.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { id: `gid://shopify/Article/${articleId}` } }),
    });

    const result = await response.json();
    const likeCount = parseInt(result?.data?.article?.likeCount?.value || 0, 10);

    let customerLikes = [];
    if (result?.data?.article?.customerLikes?.value) {
      try {
        customerLikes = JSON.parse(result.data.article.customerLikes.value);
      } catch {}
    }

    return { likeCount, customerLikes };
  }

  async updateArticleMetafields(articleId, likeCount, customerLikes) {
    const mutation = `
      mutation UpdateArticleLikes($ownerId: ID!, $likeCount: String!, $customerLikes: String!) {
        metafieldsSet(metafields: [
          { ownerId: $ownerId, namespace: "custom", key: "like_count", type: "number_integer", value: $likeCount },
          { ownerId: $ownerId, namespace: "custom", key: "customer_likes", type: "list.single_line_text_field", value: $customerLikes }
        ]) {
          metafields { id key value }
          userErrors { field message }
        }
      }
    `;

    const response = await fetch(`https://${this.store}/admin/api/${this.apiVersion}/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": this.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          ownerId: `gid://shopify/Article/${articleId}`,
          likeCount: String(likeCount),
          customerLikes: JSON.stringify(customerLikes),
        },
      }),
    });

    const result = await response.json();

    if (result?.data?.metafieldsSet?.userErrors?.length) {
      throw new Error(result.data.metafieldsSet.userErrors[0].message);
    }

    return result.data.metafieldsSet.metafields;
  }
}

module.exports = LikeModel;
