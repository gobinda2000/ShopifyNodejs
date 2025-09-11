const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema({
  shop: { type: String, unique: true },
  accessToken: String,
  installedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Shop", ShopSchema);
