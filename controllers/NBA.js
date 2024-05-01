const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const axios = require("axios");
const moment = require("moment");
const FootballFixturesModel = require("../models/Football-Fixtures");
const FootballOddsModel = require("../models/Football-Odds");
const FootballBetsModel = require("../models/Football-Bets");
const LeaguesModel = require("../models/Leagues");
const {
  prepareBet,
  groupByLeagueName,
  extractCountry,
  prepareLiveGames,
} = require("../utils");

// Get today's date
const _today = moment();

const currentYear = moment().year();

// Get the date for the next day
const nextDayDate = _today.clone().add(1, "day");

const TODAY = _today.format("YYYY-MM-DD");
const TIMEZONE = "Africa/Lagos";

const getLeagues = async (req, res) => {
  const axios = require("axios");

  const options = {
    method: "GET",
    url: "https://api-nba-v1.p.rapidapi.com/leagues",
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);

    // Extract relevant data from the response
    const { data } = response;

    const document = new LeaguesModel({
      data: data,
      date: TODAY,
      sportType: "NBA",
    });
    await document.save();

    // Send a response to the client
    res.status(200).json({
      success: true,
      message: "Leagues retrieved successfully",
      // data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching Leagues",
    });
  }
};

const getAllFixtures = async (req, res) => {
  const options = {
    method: "GET",
    url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
    params: { date: TODAY, timezone: TIMEZONE },
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);

    // Extract relevant data from the response
    const { data } = response;

    const document = new FootballFixturesModel({ data: data, date: TODAY });
    await document.save();
    // Store the data in MongoDB
    // await General.create(data);

    // const savedDocument = await FootballFixturesModel.findOne({}); // Assuming you have at least one document saved
    // console.log(savedDocument);

    // console.log(data); // Output the retrieved data for debugging

    // Send a response to the client
    res.status(200).json({
      success: true,
      message: "Fixtures retrieved successfully",
      // data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching fixtures",
    });
  }
};

const getOdds = async (req, res) => {
  const options = {
    method: "GET",
    url: "https://api-football-v1.p.rapidapi.com/v3/odds",
    params: {
      season: "2024",
      timezone: TIMEZONE,
      date: TODAY,
      page: "1",
    },
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);

    // Extract relevant data from the response
    const { data } = response;

    const document = new FootballOddsModel({ data: data, date: TODAY });
    await document.save();
    // Store the data in MongoDB
    const savedDocument = await FootballOddsModel.findOne({}); // Assuming you have at least one document saved
    console.log(savedDocument);

    // Send a response to the client
    res.status(200).json({
      success: true,
      message: "Odds retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching odds",
    });
  }
};

const getAllOdds = async (req, res) => {
  /**
   * Retrieves all odds information from an API and stores it in MongoDB.
   * @returns {Object} Object containing success status, message, and retrieved data.
   */

  const options = {
    method: "GET",
    url: "https://api-football-v1.p.rapidapi.com/v3/odds",
    params: {
      season: "2024",
      timezone: TIMEZONE,
      date: TODAY,
      page: "1", // Initial page
    },
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    },
  };

  try {
    // Initial request to get the total number of pages
    const initialResponse = await axios.request(options);
    const totalPages = initialResponse.data.paging.total;

    // Object to store all data from subsequent requests
    let allData = {
      get: initialResponse.data.get,
      response: initialResponse.data.response,
      paging: initialResponse.data.paging,
    };

    // Make iterated requests for each page
    for (let page = 2; page <= totalPages; page++) {
      // Update page parameter in options
      options.params.page = page.toString();

      // Make request for the current page
      const pageResponse = await axios.request(options);

      // Extract relevant data from the response
      const responseData = pageResponse.data.response;

      // Update paging object with current page information
      allData.paging.current = page;
      allData.paging.total = totalPages;

      // Append data to allData array
      allData.response.push(...responseData);
    }

    // Store all data in MongoDB
    await FootballOddsModel.create({ data: allData, date: TODAY });

    // Send a response to the client
    return res.status(200).json({
      success: true,
      message: "Odds retrieved successfully",
      // data: allData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching odds",
    });
  }
};

const prepareOdds = async (req, res) => {
  try {
    // Query fixtures and odds where the createdAt date is the same as the current date
    const [fixtures, odds] = await Promise.all([
      FootballFixturesModel.find({
        date: TODAY,
      }),
      FootballOddsModel.find({
        date: TODAY,
      }),
    ]);

    // Check if either fixtures or odds is null
    if (!fixtures || !odds) {
      return res.status(404).json({
        success: false,
        message: "No data found for the current date",
      });
    }
    const oddsArray = odds[0].data;
    const fixturesArray = fixtures[0].data;
    // Prepare betting data using prepareBet function
    const preparedData = prepareBet(oddsArray, fixturesArray);

    // Store the prepared data in the database
    await FootballBetsModel.create({ data: preparedData, date: TODAY });

    // Send a response to the client
    res.status(200).json({
      success: true,
      preparedData,
    });
  } catch (error) {
    console.error("Error preparing odds:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while preparing odds",
    });
  }
};

const getTodayBets = async (req, res) => {
  try {
    const bets = await FootballBetsModel.find({
      date: TODAY,
    });

    // Check if bets array is empty
    if (!bets.length) {
      return res.status(404).json({
        success: false,
        message: "No data found for the current date",
      });
    }

    // Group bets by leagueName
    const groupedBets = groupByLeagueName(bets[0].data);

    res.status(200).json({
      success: true,
      data: groupedBets,
    });
  } catch (error) {
    console.error("Error fetching today's bets:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching today's bets",
    });
  }
};

const getAToZ = async (req, res) => {
  try {
    // Query fixtures and odds where the createdAt date is the same as the current date
    const [fixtures, leagues] = await Promise.all([
      FootballFixturesModel.find({
        date: TODAY,
      }),
      LeaguesModel.find({
        sportType: "football",
      }),
    ]);

    // Check if either fixtures or odds is null
    if (!fixtures || !leagues) {
      return res.status(404).json({
        success: false,
        message: "No data found for the current date",
      });
    }
    console.log(leagues);
    const leaguesArray = leagues[0].data.response;
    const fixturesArray = fixtures[0].data.response;
    // Prepare betting data using prepareBet function
    const preparedData = await extractCountry(leaguesArray, fixturesArray);

    // Store the prepared data in the database
    // await FootballBetsModel.create({ data: preparedData, date: TODAY });

    // Send a response to the client
    res.status(200).json({
      success: true,
      preparedData,
    });
  } catch (error) {
    console.error("Error preparing odds:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while preparing odds",
    });
  }
};

const getLiveGames = async (req, res) => {
  try {
    // Query fixtures and odds where the createdAt date is the same as the current date
    const [fixtures, preparedBets] = await Promise.all([
      FootballFixturesModel.find({
        date: TODAY,
      }),
      FootballBetsModel.find({
        date: TODAY,
      }),
    ]);

    // Check if either fixtures or odds is null
    if (!fixtures || !preparedBets) {
      return res.status(404).json({
        success: false,
        message: "No data found for the current date",
      });
    }
    const preparedBetsArray = await preparedBets[0].data;
    // console.log(preparedBets);
    const fixturesArray = await fixtures[0].data.response;
    // Prepare betting data using prepareBet function
    const preparedData = await prepareLiveGames(
      fixturesArray,
      preparedBetsArray
    );

    // Store the prepared data in the database
    // await FootballBetsModel.create({ data: preparedData, date: TODAY });

    // Send a response to the client
    res.status(200).json({
      success: true,
      data: preparedData,
    });
  } catch (error) {
    console.error("Error preparing odds:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while preparing odds",
    });
  }
};

module.exports = {
  getAllFixtures,
  getOdds,
  getAllOdds,
  prepareOdds,
  getTodayBets,
  getLeagues,
  getAToZ,
  getLiveGames,
};
