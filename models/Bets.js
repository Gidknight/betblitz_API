const mongoose = require("mongoose");

// Define the schema for fixture data
const betsSchema = new mongoose.Schema(
  {
    data: mongoose.Schema.Types.Mixed,
    date: {
      type: String,
      required: [true, "the date must be provided"],
    },
    sportType: {
      type: String,
      required: [true, "the sportType must be provided"],
    },
  },
  { collection: "Bets", timestamps: true }
);

// Create the Mongoose model
const BetsModel = mongoose.model("Bets", betsSchema);

module.exports = BetsModel;
