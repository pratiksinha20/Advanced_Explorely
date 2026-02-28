const express = require("express");
const router = express.Router();
const path = require("path");

// Load states data from JSON file
const states = require(path.join(__dirname, "..", "data", "states.json"));

/**
 * GET /api/states
 * Returns all Indian states
 */
router.get("/", (req, res) => {
  try {
    res.json(states);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch states" });
  }
});

module.exports = router;