const { getArticleViewCount, updateArticleViewCount } = require("../models/articleModel");

async function incrementViewCount(req, res) {
  try {
    const { article_id } = req.body;
    if (!article_id) {
      return res.status(400).json({ success: false, error: "Missing article_id" });
    }

    const articleGID = `gid://shopify/Article/${article_id}`;
    let newCount = 1;

    // Fetch current count
    const data = await getArticleViewCount(articleGID);
    const current = data?.article?.metafield?.value;

    if (current) newCount = parseInt(current, 10) + 1;

    // Update count
    const updateRes = await updateArticleViewCount(articleGID, String(newCount));
    const errors = updateRes?.metafieldsSet?.userErrors || [];

    if (errors.length) {
      throw new Error(errors[0].message);
    }

    res.json({ success: true, article_id, new_view_count: newCount });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { incrementViewCount };
