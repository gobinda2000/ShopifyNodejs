require("dotenv").config();
const express = require("express");
const router = express.Router();

const { shopifyApi, LATEST_API_VERSION } = require("@shopify/shopify-api");
const { nodeAdapter } = require("@shopify/shopify-api/adapters/node");
const { restResources } = require("@shopify/shopify-api/rest/admin/2024-04");
const { MongoDBSessionStorage } = require("@shopify/shopify-app-session-storage-mongodb"); // ✅

const Shop = require("../models/Shop");

const app = express(); // ✅ create the app here
const serverless = require("serverless-http"); // ✅ use this for serverless

// Setup MongoDB session storage
const sessionStorage = new MongoDBSessionStorage(
  process.env.MONGO_URI,   // Your Atlas connection string
  "sessions"                 // MongoDB collection name
);

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES.split(","),
  hostName: process.env.HOST.replace(/https?:\/\//, ""),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  restResources,
  adapter: nodeAdapter,
  sessionStorage, // ✅ now using MongoDB instead of memory
});

router.get("/auth", async (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send("Missing shop param");

  const authRoute = await shopify.auth.begin({
    shop,
    callbackPath: "/auth/callback",
    isOnline: false,
    rawRequest: req,
    rawResponse: res,
  });
  res.redirect(authRoute);
});

router.get("/auth/callback", async (req, res) => {
  try {
    const session = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    // Save token to MongoDB (Shop collection)
    await Shop.findOneAndUpdate(
      { shop: session.shop },
      { accessToken: session.accessToken },
      { upsert: true, new: true }
    );

    console.log(`✅ Saved token for ${session.shop}`);

    res.send("App installed successfully! You can close this window.");
  } catch (error) {
    console.error("OAuth Error:", error);
    res.status(500).send("Auth failed");
  }
});

module.exports = serverless(app);
