const axios = require("axios");
const moment = require("moment");
const FixturesModel = require("../models/Fixtures");
const FixturesUpdateModel = require("../models/Fixtures-Update");
const BetsModel = require("../models/Bets");
const OddsModel = require("../models/Odds");
const LeaguesModel = require("../models/Leagues");
const {
  groupByLeagueName,
  extractCountry2,
  prepareLiveGames2,
  batchify,
  prepareBet2,
} = require("../utils");

// Get today's date
const _today = moment();

// Get the date for the next day
const TOMMOROW = _today.clone().add(1, "day").format("YYYY-MM-DD");

const TODAY = _today.format("YYYY-MM-DD");
const YESTERDAY = _today.clone().subtract(1, "day").format("YYYY-MM-DD");
// const TODAY = _today.format("YYYY-MM-DD");
const TIMEZONE = "Africa/Lagos";

const SPORTTYPE = "baseball";

const CURRENTYEAR = moment().year();
const nextYear = moment().add(1, "year").year();
const TOTAL_LEAGUES = 25;

const getLeagues = async (req, res) => {
  const options = {
    method: "GET",
    url: "https://api-baseball.p.rapidapi.com/leagues",
    params: { season: CURRENTYEAR },
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "api-baseball.p.rapidapi.com",
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

const getCountries = async (req, res) => {
  const options = {
    method: "GET",
    url: "https://api-basketball.p.rapidapi.com/countries",
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "api-basketball.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);

    // Extract relevant data from the response
    const { data } = response;

    const document = new LeaguesModel({
      data: data,
      date: TODAY,
      sportType: SPORTTYPE + "-" + "countries",
    });
    await document.save();

    // Send a response to the client
    res.status(200).json({
      success: true,
      message: "Countries retrieved successfully",
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
  const todayFixture = await FixturesModel.findOne({
    date: TODAY,
    sportType: SPORTTYPE,
  });

  if (todayFixture) {
    return res.status(200).json({
      success: true,
      message: "Odds already exist",
      data: todayFixture.data,
    });
  } else {
    try {
      // get leagues first
      const leaguesResponse = await LeaguesModel.findOne({
        sportType: SPORTTYPE,
        season: CURRENTYEAR,
      });

      const leagues = leaguesResponse.data.response;
      leagues.sort((a, b) => a.id - b.id);
      // console.log(leagues);
      const batchLeagues = batchify(1, leagues);
      //  const totalPages = initialResponse.data.paging.total;

      // Object to store all data from subsequent requests
      let allData = {
        response: [],
        fetched: [],
      };

      // Make iterated requests for each page
      for (let league = 0; league < batchLeagues.length; league++) {
        // Update page parameter in options
        // options.params.page = page.toString();
        let leagueID = leagues[league].id;
        let leagueName = leagues[league].name;

        console.log("Baseball fetching fixtures from =>", leagueID);
        // Make request for the current page
        const pageResponse = await axios.request({
          method: "GET",
          url: "https://api-baseball.p.rapidapi.com/games",
          params: {
            league: leagueID,
            season: CURRENTYEAR,
            date: TODAY,
            timezone: TIMEZONE,
          },
          headers: {
            "X-RapidAPI-Key": process.env.RAPID_API_KEY,
            "X-RapidAPI-Host": "api-baseball.p.rapidapi.com",
          },
        });

        // Extract relevant data from the response
        const responseData = pageResponse.data.response;
        const responseObject = {
          leagueID: leagueID,
          leagueName: leagueName,
          games: responseData,
        };

        // Update paging object with current page information
        allData.fetched.push(leagueID);
        // allData.paging.total = totalPages;

        // Append data to allData array
        allData.response.push(responseObject);
      }

      console.log("saving to mongoDB");

      // Store all data in MongoDB
      await FixturesModel.create({
        data: allData,
        date: TODAY,
        sportType: SPORTTYPE,
      });

      // Send a response to the client
      return res.status(200).json({
        success: true,
        message: "Odds retrieved successfully",
        // data: leagues,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching odds",
      });
    }
  }
};

const addFixtures = async (req, res) => {
  try {
    const { params } = req;
    const { batch_num } = params;
    // console.log(batch_num);
    // Fetch fixtures and leagues data
    const [fixturesResponse, leaguesResponse] = await Promise.all([
      FixturesModel.findOne({ date: TODAY, sportType: SPORTTYPE }), // Use findOne instead of find if you expect only one document
      LeaguesModel.findOne({ sportType: SPORTTYPE, season: CURRENTYEAR }),
    ]);

    // console.log(fixturesResponse);
    // Extract data from responses
    const fixturesData = fixturesResponse?.data ?? {};
    const leagues = leaguesResponse?.data?.response ?? [];

    // Sort leagues by ID
    leagues.sort((a, b) => a.id - b.id);

    // Split leagues into batches
    const batchLeagues = batchify(parseInt(batch_num), leagues);

    // Fetch data for each batch
    const allData = {
      response: fixturesData.response,
      fetched: fixturesData.fetched || [],
    };
    for (let i = 0; i < batchLeagues.length; i++) {
      const leagueID = batchLeagues[i].id;
      const leagueName = batchLeagues[i].name;

      console.log("Baseball adding Fixtures of => ", leagueID);

      // Make request for the current league
      const pageResponse = await axios.request({
        method: "GET",
        url: "https://api-baseball.p.rapidapi.com/games",
        params: {
          league: leagueID,
          season: CURRENTYEAR,
          date: TODAY,
          timezone: TIMEZONE,
        },
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": "api-baseball.p.rapidapi.com",
        },
      });

      // Extract relevant data from the response
      const responseData = pageResponse.data.response;
      const responseObject = {
        leagueID: leagueID,
        leagueName: leagueName,
        games: responseData,
      };
      // Append data to allData array
      allData.response.push(responseObject);
      allData.fetched.push(leagueID);
    }

    console.log("saving to mongoDB");
    // Update fixtures document in MongoDB
    await FixturesModel.updateOne(
      { date: TODAY, sportType: SPORTTYPE },
      { data: allData }
    );

    // Send a response to the client
    return res.status(200).json({
      success: true,
      message: "Fixtures added successfully",
      data: allData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching fixtures",
    });
  }
};

const getOdds = async (req, res) => {
  const options = {
    method: "GET",
    url: "https://api-baseball.p.rapidapi.com/odds",
    params: {
      season: CURRENTYEAR,
      league: "1",
    },
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "api-baseball.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);

    // Extract relevant data from the response
    const { data } = response;

    // const document = new OddsModel({ data: data, date: TODAY });
    await document.save();
    // Store the data in MongoDB
    const savedDocument = await OddsModel.findOne({}); // Assuming you have at least one document saved
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
    url: "https://api-baseball.p.rapidapi.com/odds",
    params: {
      season: CURRENTYEAR,
    },
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "api-baseball.p.rapidapi.com",
    },
  };
  const todayOdds = await OddsModel.findOne({
    date: TODAY,
    sportType: SPORTTYPE,
  });

  if (todayOdds) {
    return res.status(200).json({
      success: true,
      message: "Odds already exist",
      data: todayOdds.data,
    });
  } else {
    try {
      const fixturesResponse = await FixturesModel.findOne({
        date: TODAY,
        sportType: SPORTTYPE,
      });
      const games = fixturesResponse.data.response;

      let activeGames = [];
      games.forEach((game) => {
        if (game.games.length >= 1) {
          activeGames.push(game);
        }
      });
      console.log(activeGames);
      // Initial request to get the total number of pages
      // const initialResponse = await axios.request(options);
      // const totalPages = initialResponse.data.paging.total;

      // Object to store all data from subsequent requests
      let allData = {
        odds: [],
      };

      // Make iterated requests for each page
      for (let i = 0; i < activeGames.length; i++) {
        // Update page parameter in options
        const leagueID = activeGames[i].leagueID;
        const leagueName = activeGames[i].leagueName;
        options.params.league = leagueID;

        console.log("Baseball fetching odds of => ", leagueName);
        // Make request for the current page
        const pageResponse = await axios.request(options);

        // Extract relevant data from the response
        const responseData = pageResponse.data.response;

        const pageObject = {
          leagueID,
          leagueName,
          odds: responseData,
        };
        // Update paging object with current page information
        allData.get = pageResponse.data.get;
        allData.parameters = pageResponse.data.parameters;

        // Append data to allData array
        allData.odds.push(pageObject);
      }

      // Store all data in MongoDB
      await OddsModel.create({
        data: allData,
        date: TODAY,
        sportType: SPORTTYPE,
      });

      // Send a response to the client
      return res.status(200).json({
        success: true,
        message: "Odds retrieved successfully",
        data: allData,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching odds",
      });
    }
  }
};

const prepareOdds = async (req, res) => {
  try {
    // Query fixtures and odds where the createdAt date is the same as the current date
    const [fixturesResponse, oddsResponse] = await Promise.all([
      FixturesModel.findOne({
        date: TODAY,
        sportType: SPORTTYPE,
      }),
      OddsModel.findOne({
        date: TODAY,
        sportType: SPORTTYPE,
      }),
    ]);

    // Check if either fixtures or odds is null
    if (!fixturesResponse || !oddsResponse) {
      return res.status(404).json({
        success: false,
        message: "No data found for the current date",
      });
    }
    const oddsArray = oddsResponse.data.odds;
    const fixturesArray = fixturesResponse.data.response;
    // console.log(fixturesArray);
    // // Prepare betting data using prepareBet function
    let activeFixtures = [];
    fixturesArray.forEach((fixture) => {
      if (fixture.games.length >= 1) {
        activeFixtures.push(fixture);
      }
    });

    const preparedData = prepareBet2(oddsArray, activeFixtures);

    // Store the prepared data in the database
    await BetsModel.create({
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
    const bets = await BetsModel.findOne({
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
    // console.log(bets);
    // Group bets by leagueName
    const groupedBets = groupByLeagueName(bets.data);

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
      FixturesModel.find({
        date: TODAY,
        sportType: SPORTTYPE,
      }),
      LeaguesModel.find({
        sportType: SPORTTYPE,
        season: CURRENTYEAR,
      }),
    ]);

    // Check if either fixtures or odds is null
    if (!fixtures || !leagues) {
      return res.status(404).json({
        success: false,
        message: "No data found for the current date",
      });
    }
    const leaguesArray = leagues[0].data.response;
    const fixturesArray = fixtures[0].data.response;
    // Prepare betting data using prepareBet function

    // console.log(activeFixtures);
    const preparedData = await extractCountry2(leaguesArray, fixturesArray);

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
      FixturesModel.findOne({
        date: TODAY,
        sportType: SPORTTYPE,
      }),
      BetsModel.findOne({
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
    // console.log(fixturesArray);
    const preparedData = await prepareLiveGames2(
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

const getYesterdayFixtures = async (req, res) => {
  const updatedFixture = await FixturesUpdateModel.findOne({
    date: YESTERDAY,
    sportType: SPORTTYPE,
  });

  if (updatedFixture) {
    return res.status(200).json({
      success: true,
      message: "fixtures already retrieved",
    });
  }
  try {
    // the previos document with yesterday date
    const leaguesResponse = await LeaguesModel.findOne({
      sportType: SPORTTYPE,
      season: CURRENTYEAR,
    });

    const leagues = leaguesResponse.data.response;
    leagues.sort((a, b) => a.id - b.id);
    // console.log(leagues);
    const batchLeagues = batchify(1, leagues);
    //  const totalPages = initialResponse.data.paging.total;

    // Object to store all data from subsequent requests
    const allData = {
      updated: true,
      response: [],
      fetched: [],
    };
    // Fetch data for each batch
    for (let i = 0; i < batchLeagues.length; i++) {
      const leagueID = batchLeagues[i].id;
      const leagueName = batchLeagues[i].name;

      console.log("Baseball Fetching Yesterday Fixtures => ", leagueID);

      // Make request for the current league
      const pageResponse = await axios.request({
        method: "GET",
        url: "https://api-baseball.p.rapidapi.com/games",
        params: {
          league: leagueID,
          season: CURRENTYEAR,
          date: YESTERDAY,
          timezone: TIMEZONE,
        },
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": "api-baseball.p.rapidapi.com",
        },
      });

      // Extract relevant data from the response
      const responseData = pageResponse.data.response;
      const responseObject = {
        leagueID: leagueID,
        leagueName: leagueName,
        games: responseData,
      };
      // Append data to allData array
      allData.response.push(responseObject);
      allData.fetched.push(leagueID);
    }

    console.log("saving to mongoDB");
    // Update fixtures document in MongoDB
    await FixturesUpdateModel.create({
      date: YESTERDAY,
      sportType: SPORTTYPE,
      data: allData,
    });

    // Send a response to the client
    return res.status(200).json({
      success: true,
      message: "Fixtures retrieved successfully",
      // data: leagues,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching odds",
    });
  }
};

const addToYesterdayFixtures = async (req, res) => {
  try {
    const { params } = req;
    const { batch_num } = params;
    // the previos document with yesterday date
    const [yesterdayFixtures, leaguesResponse] = await Promise.all([
      FixturesUpdateModel.findOne({
        date: YESTERDAY,
        sportType: SPORTTYPE,
      }),
      LeaguesModel.findOne({
        sportType: SPORTTYPE,
        season: CURRENTYEAR,
      }),
    ]);
    const fixtures = yesterdayFixtures.data;
    const leagues = leaguesResponse.data.response;
    leagues.sort((a, b) => a.id - b.id);

    // console.log(leagues);
    const batchLeagues = batchify(batch_num, leagues);
    //  const totalPages = initialResponse.data.paging.total;

    // Object to store all data from subsequent requests
    const allData = {
      updated: true,
      response: fixtures?.response || [],
      fetched: fixtures?.fetched || [],
    };

    // const batched = [];
    batchLeagues.forEach((batch) => {
      let id = batch.id;
      if (allData.fetched.includes(id)) {
        return res.status(200).json({
          success: true,
          message: "fixtures already exist",
        });
      }
    });

    // Fetch data for each batch
    for (let i = 0; i < batchLeagues.length; i++) {
      const leagueID = batchLeagues[i].id;
      const leagueName = batchLeagues[i].name;

      console.log("Baseball Fetching Yesterday Fixtures => ", leagueID);

      // Make request for the current league
      const pageResponse = await axios.request({
        method: "GET",
        url: "https://api-baseball.p.rapidapi.com/games",
        params: {
          league: leagueID,
          season: CURRENTYEAR,
          date: YESTERDAY,
          timezone: TIMEZONE,
        },
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": "api-baseball.p.rapidapi.com",
        },
      });

      // Extract relevant data from the response
      const responseData = pageResponse.data.response;
      const responseObject = {
        leagueID: leagueID,
        leagueName: leagueName,
        games: responseData,
      };
      // Append data to allData array
      allData.response.push(responseObject);
      allData.fetched.push(leagueID);
    }

    console.log("saving to mongoDB");
    // Update fixtures document in MongoDB
    await FixturesUpdateModel.updateOne(
      { date: YESTERDAY, sportType: SPORTTYPE },
      { data: allData }
    );

    // Send a response to the client
    return res.status(200).json({
      success: true,
      message: "Fixtures Updated successfully",
      // data: leagues,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching odds",
    });
  }
};

const getTomorrowFixtures = async (req, res) => {
  const tomorrowFixtures = await FixturesModel.findOne({
    sportType: SPORTTYPE,
    date: TOMMOROW,
  });

  if (tomorrowFixtures) {
    return res.status(200).json({
      success: true,
      message: "tomorrow fixtures already exist",
      data: tomorrowFixtures.data,
    });
  } else {
    try {
      // get leagues first
      const leaguesResponse = await LeaguesModel.findOne({
        sportType: SPORTTYPE,
        season: CURRENTYEAR,
      });

      const leagues = leaguesResponse.data.response;
      leagues.sort((a, b) => a.id - b.id);
      // console.log(leagues);
      const batchLeagues = batchify(1, leagues);
      //  const totalPages = initialResponse.data.paging.total;

      // Object to store all data from subsequent requests
      let allData = {
        response: [],
        fetched: [],
      };

      // Make iterated requests for each page
      for (let league = 0; league < batchLeagues.length; league++) {
        // Update page parameter in options
        // options.params.page = page.toString();
        let leagueID = leagues[league].id;
        let leagueName = leagues[league].name;

        console.log("Baseball fetching Tommorow's fixtures from =>", leagueID);
        // Make request for the current page
        const pageResponse = await axios.request({
          method: "GET",
          url: "https://api-baseball.p.rapidapi.com/games",
          params: {
            league: leagueID,
            season: CURRENTYEAR,
            date: TOMMOROW,
            timezone: TIMEZONE,
          },
          headers: {
            "X-RapidAPI-Key": process.env.RAPID_API_KEY,
            "X-RapidAPI-Host": "api-baseball.p.rapidapi.com",
          },
        });

        // Extract relevant data from the response
        const responseData = pageResponse.data.response;
        const responseObject = {
          leagueID: leagueID,
          leagueName: leagueName,
          games: responseData,
        };

        // Update paging object with current page information
        allData.fetched.push(leagueID);
        // allData.paging.total = totalPages;

        // Append data to allData array
        allData.response.push(responseObject);
      }

      console.log("saving to mongoDB");

      // Store all data in MongoDB
      await FixturesModel.create({
        data: allData,
        date: TOMMOROW,
        sportType: SPORTTYPE,
      });

      // Send a response to the client
      return res.status(200).json({
        success: true,
        message: "Odds retrieved successfully",
        // data: leagues,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching odds",
      });
    }
  }
};

const addToTomorrowFixtures = async (req, res) => {
  try {
    const { params } = req;
    const { batch_num } = params;
    // console.log(batch_num);
    // Fetch fixtures and leagues data
    const [fixturesResponse, leaguesResponse] = await Promise.all([
      FixturesModel.findOne({ date: TOMMOROW, sportType: SPORTTYPE }), // Use findOne instead of find if you expect only one document
      LeaguesModel.findOne({ sportType: SPORTTYPE, season: CURRENTYEAR }),
    ]);

    // console.log(fixturesResponse);
    // Extract data from responses
    const fixturesData = fixturesResponse?.data ?? {};
    const leagues = leaguesResponse?.data?.response ?? [];

    // Sort leagues by ID
    leagues.sort((a, b) => a.id - b.id);

    // Split leagues into batches
    const batchLeagues = batchify(parseInt(batch_num), leagues);

    // Fetch data for each batch
    const allData = {
      response: fixturesData.response,
      fetched: fixturesData.fetched || [],
    };
    for (let i = 0; i < batchLeagues.length; i++) {
      const leagueID = batchLeagues[i].id;
      const leagueName = batchLeagues[i].name;

      console.log("Baseball adding Tomorrow Fixtures of => ", leagueID);

      // Make request for the current league
      const pageResponse = await axios.request({
        method: "GET",
        url: "https://api-baseball.p.rapidapi.com/games",
        params: {
          league: leagueID,
          season: CURRENTYEAR,
          date: TODAY,
          timezone: TIMEZONE,
        },
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": "api-baseball.p.rapidapi.com",
        },
      });

      // Extract relevant data from the response
      const responseData = pageResponse.data.response;
      const responseObject = {
        leagueID: leagueID,
        leagueName: leagueName,
        games: responseData,
      };
      // Append data to allData array
      allData.response.push(responseObject);
      allData.fetched.push(leagueID);
    }

    console.log("saving to mongoDB");
    // Update fixtures document in MongoDB
    await FixturesModel.updateOne(
      { date: TOMMOROW, sportType: SPORTTYPE },
      { data: allData }
    );

    // Send a response to the client
    return res.status(200).json({
      success: true,
      message: "Fixtures added successfully",
      data: allData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching fixtures",
    });
  }
};

const getTomorrowOdds = async (req, res) => {
  /**
   * Retrieves all odds information from an API and stores it in MongoDB.
   * @returns {Object} Object containing success status, message, and retrieved data.
   */

  const options = {
    method: "GET",
    url: "https://api-baseball.p.rapidapi.com/odds",
    params: {
      season: CURRENTYEAR,
    },
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "api-baseball.p.rapidapi.com",
    },
  };

  const tomorrowOdds = await OddsModel.findOne({
    date: TOMMOROW,
    sportType: SPORTTYPE,
  });

  if (tomorrowOdds) {
    return res.status(200).json({
      success: true,
      message: "Odds already exist",
      data: tomorrowOdds.data,
    });
  } else {
    try {
      const fixturesResponse = await FixturesModel.findOne({
        date: TOMMOROW,
        sportType: SPORTTYPE,
      });
      const games = fixturesResponse.data.response;

      let activeGames = [];
      games.forEach((game) => {
        if (game.games.length >= 1) {
          activeGames.push(game);
        }
      });
      console.log(activeGames);
      // Initial request to get the total number of pages
      // const initialResponse = await axios.request(options);
      // const totalPages = initialResponse.data.paging.total;

      // Object to store all data from subsequent requests
      let allData = {
        odds: [],
      };

      // Make iterated requests for each page
      for (let i = 0; i < activeGames.length; i++) {
        // Update page parameter in options
        const leagueID = activeGames[i].leagueID;
        const leagueName = activeGames[i].leagueName;
        options.params.league = leagueID;

        console.log("Baseball fetching Tomorrow's odds of => ", leagueName);
        // Make request for the current page
        const pageResponse = await axios.request(options);

        // Extract relevant data from the response
        const responseData = pageResponse.data.response;

        const pageObject = {
          leagueID,
          leagueName,
          odds: responseData,
        };
        // Update paging object with current page information
        allData.get = pageResponse.data.get;
        allData.parameters = pageResponse.data.parameters;

        // Append data to allData array
        allData.odds.push(pageObject);
      }

      // Store all data in MongoDB
      await OddsModel.create({
        data: allData,
        date: TOMMOROW,
        sportType: SPORTTYPE,
      });

      // Send a response to the client
      return res.status(200).json({
        success: true,
        message: "Odds retrieved successfully",
        data: allData,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching odds",
      });
    }
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
  getCountries,
  addFixtures,
  getYesterdayFixtures,
  getTomorrowFixtures,
  addToTomorrowFixtures,
  getTomorrowOdds,
  addToYesterdayFixtures,
};
