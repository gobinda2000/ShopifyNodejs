require("dotenv").config();

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || "app-view.myshopify.com";
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-07";
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

if (!SHOPIFY_ACCESS_TOKEN) {
  console.warn("[shopify] Missing SHOPIFY_ACCESS_TOKEN in .env");
}

module.exports = {
  SHOPIFY_STORE,
  SHOPIFY_API_VERSION,
  SHOPIFY_ACCESS_TOKEN,
};