const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const articleRoutes = require("./routes/articleRoutes");
const likeRoutes = require("./routes/articleRoutes");

const connectDB = require("./db");
const authRoutes = require("./routes/authRoutes");

connectDB();

const app = express();

app.use(cors({
  origin: "*", // you can restrict to ["https://yourstore.myshopify.com"]
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const PORT = process.env.PORT || 9292;
app.use(cors());
// Middleware
app.use(bodyParser.json());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({
    message: "Test route is working Fine",
    timestamp: new Date().toISOString()
  });
});

app.use("/", authRoutes);
// Routes
app.use("/", articleRoutes);
app.use("/", likeRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
