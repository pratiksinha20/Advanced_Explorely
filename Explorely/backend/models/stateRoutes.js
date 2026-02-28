const express = require("express");
const router = express.Router();
const states = require("../data/states.json");

router.get("/states", (req, res) => {
  res.json(states);
});

module.exports = router;
