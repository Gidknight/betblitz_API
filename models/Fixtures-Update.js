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
      required: [true, "the sportType must be provided"],
    },
  },
  { collection: "Fixtures-Update", timestamps: true }
);

// Create the Mongoose model
const FixturesUpdateModel = mongoose.model("Fixtures-Update", fixtureSchema);

module.exports = FixturesUpdateModel;
