const mongoose = require("mongoose");

// Define the schema for fixture data
const fixtureSchema = new mongoose.Schema(
  {
    data: mongoose.Schema.Types.Mixed,
    date: {
      type: String,
      required: [true, "the date must be provided"],
    },
  },
  { collection: "Baseball-Fixtures", timestamps: true }
);

// Create the Mongoose model
const BaseballFixturesModel = mongoose.model(
  "Baseball-Fixtures",
  fixtureSchema
);

module.exports = BaseballFixturesModel;
