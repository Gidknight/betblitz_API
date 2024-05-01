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
} = require("../controllers/handball");

router.route("/handball/get-leagues").get(getLeagues);
router.route("/handball/get-countries").get(getCountries);
router
  .route("/handball/get-today-fixtures/:batch_num")
  .get(getAllFixtures)
  .patch(addFixtures);
router
  .route("/handball/get-yesterday-fixtures/:batch_num")
  .get(getYesterdayFixtures)
  .patch(addToYesterdayFixtures);
router.route("/handball/get-odds").get(getOdds);
router.route("/handball/get-today-odds").get(getAllOdds);
router.route("/handball/prepare-bets").get(prepareOdds);
router.route("/handball/front/get-today-bets").get(getTodayBets);
router.route("/handball/front/get-a-to-z").get(getAToZ);
router.route("/handball/front/get-livegames").get(getLiveGames);
router
  .route("/handball/get-tomorrow-fixtures/:batch_num")
  .get(getTomorrowFixtures)
  .patch(addToTomorrowFixtures);
router.route("/handball/get-tomorrow-odds").get(getTomorrowOdds);
// router.route("/job/:id").get(getSingleJob).patch(updateJob).delete(deleteJob);

module.exports = router;
