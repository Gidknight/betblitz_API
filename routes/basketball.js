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
} = require("../controllers/basketball");

router.route("/basketball/get-leagues").get(getLeagues);
router.route("/basketball/get-countries").get(getCountries);
router
  .route("/basketball/get-today-fixtures/:batch_num")
  .get(getAllFixtures)
  .patch(addFixtures);
router
  .route("/basketball/get-yesterday-fixtures/:batch_num")
  .get(getYesterdayFixtures)
  .patch(addToYesterdayFixtures);
router.route("/basketball/get-odds").get(getOdds);
router.route("/basketball/get-today-odds").get(getAllOdds);
router.route("/basketball/prepare-bets").get(prepareOdds);
router.route("/basketball/front/get-today-bets").get(getTodayBets);
router.route("/basketball/front/get-a-to-z").get(getAToZ);
router.route("/basketball/front/get-livegames").get(getLiveGames);
router.route("/basketball/get-tomorrow-fixtures").get(getTomorrowFixtures);
router
  .route("/basketball/get-tomorrow-odds/:batch_num")
  .get(getTomorrowOdds)
  .patch(addToTomorrowFixtures);
// router.route("/job/:id").get(getSingleJob).patch(updateJob).delete(deleteJob);

module.exports = router;
