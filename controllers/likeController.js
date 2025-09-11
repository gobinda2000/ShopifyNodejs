// controllers/likeController.js
const { fetchArticleLikes, updateArticleLikes } = require("../services/likeService");

async function incrementLikeCount(req, res) {
  try {
    const { article_id, customer_id } = req.body;
    if (!article_id || !customer_id) {
      return res.status(400).json({ success: false, error: "Missing article_id or customer_id" });
    }

    const articleGID = `gid://shopify/Article/${article_id}`;
    const result = await fetchArticleLikes(articleGID);

    const likeCount = result?.data?.article?.likeCount?.value
      ? parseInt(result.data.article.likeCount.value, 10)
      : 0;

    let customerLikes = [];
    const rawCustomerLikes = result?.data?.article?.customerLikes?.value;
    if (rawCustomerLikes) {
      try {
        customerLikes = JSON.parse(rawCustomerLikes);
      } catch {
        customerLikes = [];
      }
    }

    // already liked?
    if (customerLikes.includes(customer_id)) {
      return res.status(200).json({
        success: false,
        message: "User already liked this article.",
        like_count: likeCount,
      });
    }

    // increment
    const newLikeCount = likeCount + 1;
    customerLikes.push(customer_id);

    const updateResult = await updateArticleLikes(articleGID, newLikeCount, customerLikes);

    if (updateResult?.data?.metafieldsSet?.userErrors?.length) {
      throw new Error(updateResult.data.metafieldsSet.userErrors[0].message);
    }

    res.json({
      success: true,
      article_id,
      like_count: newLikeCount,
      message: "Article liked successfully",
    });
  } catch (err) {
    console.error("Error updating article like_count:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { incrementLikeCount };
