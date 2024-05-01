const mongoose = require("mongoose");

// Define the schema for fixture data
const oddsSchema = new mongoose.Schema(
  {
    data: mongoose.Schema.Types.Mixed,
    date: {
      type: String,
      required: [true, "the date must be provided"],
    },
    sportType: {
      type: String,
      required: [true, "the sport type must be provided"],
    },
  },
  { collection: "Odds", timestamps: true }
);

// Create the Mongoose model
const OddsModel = mongoose.model("Odds", oddsSchema);

module.exports = OddsModel;
