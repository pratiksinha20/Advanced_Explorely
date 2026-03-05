const express = require("express");
const cors = require("cors");

// Import routes
const stateRoutes = require("./routes/states");
const cityRoutes = require("./routes/cities");
const spotRoutes = require("./routes/spots");

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

// API Routes
app.use("/api/states", stateRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/spots", spotRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Explorely API is running 🚀" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Explorely backend running on http://localhost:${PORT}`);
});
