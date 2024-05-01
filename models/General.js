const mongoose = require("mongoose");

// Define a schema with a single field of type Mixed
const generalSchema = new mongoose.Schema(
  {
    data: mongoose.Schema.Types.Mixed,
  },
  { collection: "Football-Fixtures", timestamps: true }
);

// Create the Mongoose model
const GeneralModel = mongoose.model("General", generalSchema);

module.exports = GeneralModel;
