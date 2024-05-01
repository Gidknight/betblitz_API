const express = require("express");
const router = express.Router();

const {
  getAllFixtures,
  getAllOdds,
  prepareOdds,
  getTodayBets,
  getLeagues,
  getAToZ,
  getLiveGames,
  getOdds,
  addOdds,
} = require("../controllers/football");

router.route("/football/get-leagues").get(getLeagues);
router.route("/football/get-fixtures").get(getAllFixtures);
router.route("/football/get-odds").get(getOdds);
router.route("/football/add-odds/:page_number").get(addOdds);
router.route("/football/getall-odds").get(getAllOdds);
router.route("/football/prepare-bets").get(prepareOdds);
router.route("/football/front/get-today-bets").get(getTodayBets);
router.route("/football/front/get-a-to-z").get(getAToZ);
router.route("/football/front/get-livegames").get(getLiveGames);
// router.route("/job/:id").get(getSingleJob).patch(updateJob).delete(deleteJob);

module.exports = router;
