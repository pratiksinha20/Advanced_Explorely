const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String },
});

module.exports = mongoose.model('State', stateSchema);
