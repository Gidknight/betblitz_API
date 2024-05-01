const mongoose = require("mongoose");

// Define the schema for fixture data
const oddSchema = new mongoose.Schema(
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
  { collection: "Football-Odds", timestamps: true }
);

// Create the Mongoose model
const FootballOddsModel = mongoose.model("Football-Odds", oddSchema);

module.exports = FootballOddsModel;
