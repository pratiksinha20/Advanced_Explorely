const express = require("express");
const router = express.Router();
const cities = require("../data/cities.json");

router.get("/cities", (req, res) => {
  const { state } = req.query;

  if (!state) {
    return res.status(400).json([]);
  }

  const filteredCities = cities.filter(
    (city) => city.state === state
  );

  res.json(filteredCities);
});

module.exports = router;
