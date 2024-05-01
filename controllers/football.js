const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const axios = require("axios");
const moment = require("moment");
const FixturesModel = require("../models/Fixtures");
const OddsModel = require("../models/Odds");
const BetsModel = require("../models/Bets");
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

// Get the date for the next day
const TOMMOROW = _today.clone().add(1, "day").format("YYYY-MM-DD");

const TODAY = _today.format("YYYY-MM-DD");
const YESTERDAY = _today.clone().subtract(1, "day").format("YYYY-MM-DD");
// const TODAY = _today.format("YYYY-MM-DD");
const TIMEZONE = "Africa/Lagos";

const SPORTTYPE = "football";

const CURRENTYEAR = moment().year();
const nextYear = moment().add(1, "year").year();
const TOTAL_LEAGUES = 25;

const getLeagues = async (req, res) => {
  const options = {
    method: "GET",
    url: "https://api-football-v1.p.rapidapi.com/v3/leagues",
    params: { season: "2024" },
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    },
  };

  const currentSeason = await LeaguesModel.findOne({
    sportType: SPORTTYPE,
    season: CURRENTYEAR,
  });

  if (currentSeason) {
    return res.status(200).json({
      success: true,
      message: "league already exist",
    });
  } else {
    try {
      const response = await axios.request(options);

      // Extract relevant data from the response
      const { data } = response;

      const document = new LeaguesModel({
        data: data,
        date: TODAY,
        sportType: SPORTTYPE,
        season: CURRENTYEAR,
      });
      await document.save();
      // Store the data in MongoDB
      // await General.create(data);

      // const savedDocument = await FootballFixturesModel.findOne({}); // Assuming you have at least one document saved
      // console.log(savedDocument);

      // console.log(data); // Output the retrieved data for debugging

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

    const document = new FootballFixturesModel({
      data: data,
      date: TODAY,
      sportType: SPORTTYPE,
    });
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

    const document = new FootballOddsModel({
      data: data,
      date: TODAY,
      sportType: SPORTTYPE,
    });
    await document.save();
    // Store the data in MongoDB
    // const savedDocument = await OddsModel.findOne({}); // Assuming you have at least one document saved
    // console.log(savedDocument);

    // Send a response to the client
    res.status(200).json({
      success: true,
      message: "Odds retrieved successfully",
      totalPages: data.paging.total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching odds",
    });
  }
};

const addOdds = async (req, res) => {
  try {
    const { params } = req;
    const { page_number } = params;
    // console.log(page_number);
    // Fetch fixtures and leagues data
    const oddsResponse = await FootballOddsModel.findOne({
      date: TODAY,
      sportType: SPORTTYPE,
    }); // Use findOne instead of find if you expect only one document

    // console.log(fixturesResponse);
    // Extract data from responses
    const initialOdds = oddsResponse?.data ?? {};

    // console.log(initialOdds);
    // Fetch data for each batch
    const allData = {
      response: initialOdds?.response,
      paging: initialOdds?.paging,
      parameters: initialOdds?.parameters,
    };

    const options = {
      method: "GET",
      url: "https://api-football-v1.p.rapidapi.com/v3/odds",
      params: {
        season: "2024",
        timezone: TIMEZONE,
        date: TODAY,
        page: page_number,
      },
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_API_KEY,
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
      },
    };
    const response = await axios.request(options);

    // Extract relevant data from the response
    const { data } = response;

    allData.paging = data?.paging;
    allData.parameters = data?.parameters;
    allData.response.push(...data?.response);

    console.log("saving to mongoDB");
    // Update fixtures document in MongoDB
    await FootballOddsModel.updateOne(
      { date: TODAY, sportType: SPORTTYPE },
      { data: allData }
    );

    // Send a response to the client
    return res.status(200).json({
      success: true,
      message: "New Odds added successfully",
      paging: allData.paging,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching fixtures",
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
    await FootballOddsModel.create({
      data: allData,
      date: TODAY,
      sportType: SPORTTYPE,
    });

    // Send a response to the client
    return res.status(200).json({
      success: true,
      message: "football Odds retrieved successfully",
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
      FootballFixturesModel.findOne({
        date: TODAY,
        sportType: SPORTTYPE,
      }),
      FootballOddsModel.findOne({
        date: TODAY,
        sportType: SPORTTYPE,
      }),
    ]);

    // Check if either fixtures or odds is null
    if (!fixtures || !odds) {
      return res.status(404).json({
        success: false,
        message: "No data found for the current date",
      });
    }
    const oddsArray = odds?.data;
    const fixturesArray = fixtures?.data;
    // Prepare betting data using prepareBet function
    const preparedData = prepareBet(oddsArray, fixturesArray);

    // Store the prepared data in the database
    await FootballBetsModel.create({
      data: preparedData,
      date: TODAY,
      sportType: SPORTTYPE,
    });

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
    const bets = await FootballBetsModel.findOne({
      date: TODAY,
      sportType: SPORTTYPE,
    });

    // Check if bets array is empty
    if (!bets) {
      return res.status(404).json({
        success: false,
        message: "No data found for the current date",
      });
    }

    // Group bets by leagueName
    const groupedBets = groupByLeagueName(bets?.data);

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
      FootballFixturesModel.findOne({
        date: TODAY,
        sportType: SPORTTYPE,
      }),
      LeaguesModel.findOne({
        sportType: SPORTTYPE,
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
    const leaguesArray = leagues.data.response;
    const fixturesArray = fixtures.data.response;
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
      FootballFixturesModel.findOne({
        date: TODAY,
        sportType: SPORTTYPE,
      }),
      FootballBetsModel.findOne({
        date: TODAY,
        sportType: SPORTTYPE,
      }),
    ]);

    // Check if either fixtures or odds is null
    if (!fixtures || !preparedBets) {
      return res.status(404).json({
        success: false,
        message: "No data found for the current date",
      });
    }
    const preparedBetsArray = await preparedBets.data;
    // console.log(preparedBets);
    const fixturesArray = await fixtures.data.response;
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
  addOdds,
};
