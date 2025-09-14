// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { shopifyApi, LATEST_API_VERSION } = require("@shopify/shopify-api");
const { nodeAdapter } = require("@shopify/shopify-api/adapters/node");
const { restResources } = require("@shopify/shopify-api/rest/admin/2024-04");
const { MongoDBSessionStorage } = require("@shopify/shopify-app-session-storage-mongodb");
const Shop = require("../models/Shop");   // ✅ relative path fix

const app = express();
const serverless = require("serverless-http"); // ✅ use this for serverless

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

const sessionStorage = new MongoDBSessionStorage(process.env.MONGO_URI, "sessions");

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES.split(","),
  hostName: process.env.HOST.replace(/https?:\/\//, ""),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  restResources,
  adapter: nodeAdapter,
  sessionStorage,
});

// Routes
app.get("/", (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send("Missing ?shop= parameter");
  res.redirect(`/auth?shop=${shop}`);
});

// ✅ CORRECTED CODE

app.get("/auth", async (req, res) => {
  const shop = req.query.shop;
  if (!shop) {
    return res.status(400).send("Missing shop param");
  }

  // The `begin` function will handle the redirection itself.
  // We still `await` it to ensure the process completes.
  await shopify.auth.begin({
    shop,
    callbackPath: "/auth/callback",
    isOnline: false,
    rawRequest: req,
    rawResponse: res,
  });

  // No more res.redirect() here!
});

app.get("/auth/callback", async (req, res) => {
  try {
    const session = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    await Shop.findOneAndUpdate(
      { shop: session.shop },
      { accessToken: session.accessToken },
      { upsert: true, new: true }
    );

    console.log(`✅ Token saved for ${session.shop}`);
    res.send("App installed successfully! You can close this window.");
  } catch (error) {
    console.error("❌ OAuth error:", error);
    res.status(500).send("Auth failed");
  }
});

module.exports = serverless(app);