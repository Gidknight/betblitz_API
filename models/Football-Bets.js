const mongoose = require("mongoose");

// Define the schema for fixture data
const betsSchema = new mongoose.Schema(
  {
    data: mongoose.Schema.Types.Mixed,
    date: {
      type: String,
      required: [true, "the dat must be provided"],
    },
    sportType: {
      type: String,
      required: [true, "the sport type must be provided"],
    },
  },
  { collection: "Football-Bets", timestamps: true }
);

// Create the Mongoose model
const FootballBetsModel = mongoose.model("FootballBets", betsSchema);

module.exports = FootballBetsModel;
