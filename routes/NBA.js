const express = require("express");
const router = express.Router();

const {
  getAllFixtures,
  getAllOdds,
  prepareOdds,
  getOdds,
  getTodayBets,
  getLeagues,
  getAToZ,
  getLiveGames,
} = require("../controllers/NBA");

router.route("/NBA/get-leagues").get(getLeagues);
router.route("/NBA/get-fixtures").get(getAllFixtures);
router.route("/NBA/get-odds").get(getOdds);
router.route("/NBA/getall-odds").get(getAllOdds);
router.route("/NBA/prepare-bets").get(prepareOdds);
router.route("/NBA/front/get-today-bets").get(getTodayBets);
router.route("/NBA/front/get-a-to-z").get(getAToZ);
router.route("/NBA/front/get-livegames").get(getLiveGames);
// router.route("/job/:id").get(getSingleJob).patch(updateJob).delete(deleteJob);

module.exports = router;
