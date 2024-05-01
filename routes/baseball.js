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
  getCountries,
  addFixtures,
  getYesterdayFixtures,
  getTomorrowFixtures,
  addToTomorrowFixtures,
  getTomorrowOdds,
  addToYesterdayFixtures,
} = require("../controllers/baseball");

router.route("/baseball/get-leagues").get(getLeagues);
router.route("/baseball/get-countries").get(getCountries);
router
  .route("/baseball/get-today-fixtures/:batch_num")
  .get(getAllFixtures)
  .patch(addFixtures);
router
  .route("/baseball/get-yesterday-fixtures/:batch_num")
  .get(getYesterdayFixtures)
  .patch(addToYesterdayFixtures);
router.route("/baseball/get-odds").get(getOdds);
router.route("/baseball/get-today-odds").get(getAllOdds);
router.route("/baseball/prepare-bets").get(prepareOdds);
router.route("/baseball/front/get-today-bets").get(getTodayBets);
router.route("/baseball/front/get-a-to-z").get(getAToZ);
router.route("/baseball/front/get-livegames").get(getLiveGames);
router
  .route("/baseball/get-tomorrow-fixtures/:batch_num")
  .get(getTomorrowFixtures)
  .patch(addToTomorrowFixtures);

router.route("/baseball/get-tomorrow-odds").get(getTomorrowOdds);
// router.route("/job/:id").get(getSingleJob).patch(updateJob).delete(deleteJob);

module.exports = router;
