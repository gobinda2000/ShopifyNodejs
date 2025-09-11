const express = require("express");
const router = express.Router();
const { incrementViewCount } = require("../controllers/articleController");
const { incrementLikeCount } = require("../controllers/likeController");

router.post("/apps/articles", incrementViewCount);
router.post("/apps/articles/likes", incrementLikeCount);

module.exports = router;
