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
} = require("../controllers/hockey");

router.route("/hockey/get-leagues").get(getLeagues);
router.route("/hockey/get-countries").get(getCountries);

router
  .route("/hockey/get-today-fixtures/:batch_num")
  .get(getAllFixtures)
  .patch(addFixtures);
router
  .route("/hockey/get-yesterday-fixtures/:batch_num")
  .get(getYesterdayFixtures)
  .patch(addToYesterdayFixtures);
router.route("/hockey/get-odds").get(getOdds);
router.route("/hockey/get-today-odds").get(getAllOdds);
router.route("/hockey/prepare-bets").get(prepareOdds);
router.route("/hockey/front/get-today-bets").get(getTodayBets);
router.route("/hockey/front/get-a-to-z").get(getAToZ);
router.route("/hockey/front/get-livegames").get(getLiveGames);
router
  .route("/hockey/get-tomorrow-fixtures/:batch_num")
  .get(getTomorrowFixtures)
  .patch(addToTomorrowFixtures);
router.route("/hockey/get-tomorrow-odds").get(getTomorrowOdds);
// router.route("/job/:id").get(getSingleJob).patch(updateJob).delete(deleteJob);

module.exports = router;
