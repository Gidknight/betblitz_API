const mongoose = require("mongoose");

// Define the schema for fixture data
const fixtureSchema = new mongoose.Schema(
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
  { collection: "Football-Fixtures", timestamps: true }
);

// Create the Mongoose model
const FootballFixturesModel = mongoose.model(
  "Football-Fixtures",
  fixtureSchema
);

module.exports = FootballFixturesModel;
