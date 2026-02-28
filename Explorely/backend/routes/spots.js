const express = require("express");
const router = express.Router();
const path = require("path");

// Load spots data from JSON file
const spots = require(path.join(__dirname, "..", "data", "spots.json"));

/**
 * GET /api/spots?city=CityName
 * Returns tourist spots filtered by city name
 */
router.get("/", (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ error: "City query parameter is required" });
    }

    // Filter spots by city (case-insensitive)
    const filtered = spots.filter(
      (spot) => spot.city.toLowerCase() === city.toLowerCase()
    );

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch spots" });
  }
});

module.exports = router;