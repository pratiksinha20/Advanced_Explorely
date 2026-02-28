const express = require("express");
const router = express.Router();
const path = require("path");

// Load cities data from JSON file
const cities = require(path.join(__dirname, "..", "data", "cities.json"));

/**
 * GET /api/cities?state=StateName
 * Returns cities filtered by state name
 */
router.get("/", (req, res) => {
  try {
    const { state } = req.query;

    if (!state) {
      return res.status(400).json({ error: "State query parameter is required" });
    }

    // Filter cities by state (case-insensitive)
    const filtered = cities.filter(
      (city) => city.state.toLowerCase() === state.toLowerCase()
    );

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

module.exports = router;