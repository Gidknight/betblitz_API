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
  { collection: "Basketball-Fixtures", timestamps: true }
);

// Create the Mongoose model
const BasketballFixturesModel = mongoose.model(
  "Basketball-Fixtures",
  fixtureSchema
);

module.exports = BasketballFixturesModel;
