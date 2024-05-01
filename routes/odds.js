const express = require("express");
const router = express.Router();

const {
  getFootball,
  getBasketball,
  getHockey,
  updateJob,
  deleteJob,
} = require("../controllers/fetchOdds");

router.route("/fetch-odds").get(getFootball, getBasketball, getHockey);
// router.route("/job/:id").get(getSingleJob).patch(updateJob).delete(deleteJob);

module.exports = router;
