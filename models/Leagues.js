const mongoose = require("mongoose");

// Define the schema for fixture data
const leaguesSchema = new mongoose.Schema(
  {
    data: mongoose.Schema.Types.Mixed,
    date: {
      type: String,
      required: [true, "the date must be provided"],
    },
    sportType: {
      type: String,
      required: [true, "sport type must be specified"],
    },
    season: {
      type: String,
      required: [true, "sport type must be specified"],
    },
  },
  { collection: "Active-Leagues", timestamps: true }
);

// Create the Mongoose model
const LeaguesModel = mongoose.model("Leagues", leaguesSchema);

module.exports = LeaguesModel;
