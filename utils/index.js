const moment = require("moment-timezone");

const prepareBet = (oddsArray = [], fixtures = []) => {
  /**
   * accepts fixtures array and odds array
   * @param {array} oddsArray - the odds array
   * @param {array} fixtures - the fixtures
   * @returns {array} The array of fixtures with their odds
   */

  if (oddsArray.length || fixtures.length) return;

  const fixResponse = fixtures?.response;
  const oddResponse = oddsArray.response;
  let fixturesArray = [];
  let oddsMap = {};

  // Store odds in a map with fixture ID as the key
  for (let i = 0; i < oddResponse.length; i++) {
    let leagueID = oddResponse[i].league.id;
    let fixtureID = oddResponse[i].fixture.id;
    let odds = oddResponse[i].bookmakers[0].bets;

    if (!oddsMap[fixtureID]) {
      oddsMap[fixtureID] = { leagueID, odds };
    }
  }

  // Merge fixtures with odds
  for (let i = 0; i < fixResponse.length; i++) {
    let currentLeagueId = fixResponse[i].league.id;
    let fixtureId = fixResponse[i].fixture.id;
    let leagueName = fixResponse[i].league.name;
    let leagueLogo = fixResponse[i].league.logo;
    let teams = fixResponse[i].teams;
    let fixture = fixResponse[i].fixture;

    // Check if odds exist for this fixture
    if (oddsMap[fixtureId]) {
      let { leagueID, odds } = oddsMap[fixtureId];
      fixturesArray.push({
        fixtureID: fixtureId,
        leagueID: leagueID,
        leagueName,
        leagueLogo,
        teams,
        odds,
        fixture,
      });
    }
  }

  return fixturesArray;
};

const prepareBet2 = (oddsArray = [], fixtures = []) => {
  /**
   * accepts fixtures array and odds array
   * @param {array} oddsArray - an array of objects containing leagueID, leagueName, and odds array
   * @param {array} fixtures - the fixtures
   * @returns {array} The array of objects with leagueID, leagueName, and games array containing objects of odds
   */

  // Check if either oddsArray or fixtures array is empty
  if (oddsArray.length < 1 || fixtures.length < 1) return [];

  // Initialize an array to store the result
  let resultArray = [];
  const bm = {
    id: 3,
    name: "Betfair",
  };
  // Group all league games into an object
  const leagueGamesMap = {};
  oddsArray.forEach((odd) => {
    const { leagueID, odds } = odd;

    let finalArray = [];

    for (let i = 0; i < odds.length; i++) {
      let leagueName = odds[i].league.name;
      let leagueID = odds[i].league.id;
      let leagueLogo = odds[i].league.logo;
      let game = odds[i].game;
      // let bookmaker = odds[i].bookmakers.find(
      //   (keeper) => keeper.name == bm.name
      // );
      // console.log(bookmaker);
      let bookmaker = odds[i].bookmakers[0];
      let league = odds[i].league;

      finalArray.push({
        leagueID,
        leagueName,
        leagueLogo,
        league,
        game,
        bookmaker,
      });
    }
    leagueGamesMap[leagueID] = finalArray;
  });

  // Merge fixtures with odds
  fixtures.forEach((fixture) => {
    // Extract league ID and league name from the fixture object
    const { leagueID, leagueName } = fixture;
    // Find the corresponding games array for the leagueID
    const games = leagueGamesMap[leagueID] || [];
    // const bets = leagueGamesMap[leagueID].odds;
    // Extract the first element in the games array and add it to the result array
    resultArray.push({
      leagueID,
      leagueName,
      games,
    });
  });

  // Return the final result array
  return resultArray;
};

const prepareTopLeagues = async (fixturesArray = [], leagueNames = []) => {
  /**
   * accepts fixtures array and odds array
   * @param {array} oddsArray - the odds array
   * @param {array} fixtures - the fixtures
   * @returns {array} The array of fixtures with their odds
   */

  if (oddsArray.length || fixtures.length) return;
};

const groupByLeagueName = (bets) => {
  // Use Array.reduce to group bets by leagueName
  const groupedBets = bets.reduce((accumulator, currentValue) => {
    // Check if accumulator already has an array for the current leagueName
    if (accumulator[currentValue.leagueName]) {
      // If yes, push the current bet object into the existing array
      accumulator[currentValue.leagueName].push(currentValue);
    } else {
      // If no, create a new array with the current bet object
      accumulator[currentValue.leagueName] = [currentValue];
    }
    return accumulator;
  }, {});

  // Convert the grouped bets object to an array of arrays
  const result = Object.values(groupedBets);
  return result;
};

const extractCountry_ = async (countryArray = [], fixtureArray = []) => {
  if (countryArray.length === 0 || fixtureArray.length === 0) return;

  let countries = [];
  let fixMap = {};

  // Store country details in a map with country name as the key
  for (let i = 0; i < countryArray.length; i++) {
    let countryName = countryArray[i].country.name;
    let countryDetail = countryArray[i].country;

    fixMap[countryName] = countryDetail;
  }

  // Populate countries array with all countries
  for (let countryName in fixMap) {
    countries.push({ name: countryName, fixtures: [] });
  }

  // Merge fixtures with country
  for (let i = 0; i < fixtureArray.length; i++) {
    let countryName = fixtureArray[i].league.country;
    let fixtureDetail = fixtureArray[i];

    // Push fixture into the corresponding country's fixtures array
    let countryIndex = countries.findIndex(
      (country) => country.name === countryName
    );
    if (countryIndex !== -1) {
      countries[countryIndex].fixtures.push(fixtureDetail);
    }
  }

  countries.sort((a, b) => a.name.localeCompare(b.name));
  return countries;
};

const extractCountry = async (countryArray = [], fixtureArray = []) => {
  if (countryArray.length === 0 || fixtureArray.length === 0) return;

  let countries = [];

  // Group fixtures by country and leagueName
  for (let i = 0; i < fixtureArray.length; i++) {
    let countryName = fixtureArray[i].league.country;
    let countryFlag = fixtureArray[i].league.flag;
    let leagueName = fixtureArray[i].league.name;
    let leagueLogo = fixtureArray[i].league.logo;
    let leagueID = fixtureArray[i].league.id;

    // Check if the country exists in the countries array
    let countryIndex = countries.findIndex(
      (country) => country.name === countryName
    );
    if (countryIndex === -1) {
      // If the country doesn't exist, add it with an empty array for leagues
      countries.push({
        name: countryName,
        flag: countryFlag,
        leagueID,
        leagues: [],
      });
      countryIndex = countries.length - 1;
    }

    // Check if the league exists in the country's leagues array
    let leagueIndex = countries[countryIndex].leagues.findIndex(
      (league) => league.name === leagueName
    );
    if (leagueIndex === -1) {
      // If the league doesn't exist, add it to the leagues array with an empty array for fixtures
      countries[countryIndex].leagues.push({
        name: leagueName,
        logo: leagueLogo,
        leagueID,
        fixtures: [],
      });
      leagueIndex = countries[countryIndex].leagues.length - 1;
    }

    // Push the fixture into the corresponding league's fixtures array
    countries[countryIndex].leagues[leagueIndex].fixtures.push(fixtureArray[i]);
  }

  // Sort countries by name
  countries.sort((a, b) => a.name.localeCompare(b.name));

  return countries;
};

const extractCountry2 = async (leaguesArray = [], fixtureArray = []) => {
  if (leaguesArray.length === 0 || fixtureArray.length === 0) return;

  let countries = [];
  let leagueGames = [];

  let activeFixtures = [];
  fixtureArray.forEach((fixture) => {
    // allFixtures.push(fixture);
    if (fixture.games.length >= 1) {
      activeFixtures.push(fixture);
    }
  });

  leaguesArray.forEach((league) => {
    let countryName = league.country.name;
    let countryID = league.country.id;
    let countryFlag = league.country.flag;
    let countryIndex = countries.findIndex(
      (country) => country.name == countryName
    );
    if (countryIndex === -1) {
      // If the country doesn't exist, add it with an empty array for leagues

      countries.push({
        id: countryID,
        name: countryName,
        flag: countryFlag,
        leagues: [],
      });

      countryIndex = countries.length - 1;
    }
  });
  // console.log(countries.length);
  // Group fixtures by country and leagueName
  for (let i = 0; i < activeFixtures.length; i++) {
    let countryName = activeFixtures[i].games[0].country?.name;
    let countryFlag = activeFixtures[i].games[0].country?.flag;
    let leagueName = activeFixtures[i].games[0]?.league?.name;
    let leagueLogo = activeFixtures[i].games[0]?.league?.logo;
    let leagueID = activeFixtures[i].games[0]?.league?.id;

    // Check if the country exists in the leagueGames array
    let countryIndex = countries.findIndex(
      (country) => country.name === countryName
    );
    // if (countryIndex === -1) {
    //   // If the country doesn't exist, add it with an empty array for leagues
    //   countries[countryIndex].leagues = [];
    //   // leagueGames.push({
    //   //   name: countryName,
    //   //   flag: countryFlag,
    //   //   leagueID,
    //   //   leagues: [],
    //   // });

    //   countryIndex = countries.length - 1;
    //   // countryIndex = leagueGames.length - 1;
    // }
    // console.log(leagueGames[countryIndex]);
    // Check if the league exists in the country's leagues array
    let leagueIndex = countries[countryIndex]?.leagues.findIndex(
      (league) => league.name === leagueName
    );
    // let leagueIndex = leagueGames[countryIndex]?.leagues.findIndex(
    //   (league) => league.name === leagueName
    // );
    if (leagueIndex === -1) {
      // If the league doesn't exist, add it to the leagues array with an empty array for fixtures
      countries[countryIndex].leagues.push({
        id: leagueID,
        name: leagueName,
        logo: leagueLogo,
        leagueID,
        fixtures: [],
      });
      leagueIndex = countries[countryIndex].leagues.length - 1;
    }

    // Push the fixture into the corresponding league's fixtures array
    countries[countryIndex].leagues[leagueIndex].fixtures.push(
      activeFixtures[i]
    );
  }

  // Sort countries by name
  countries.sort((a, b) => a.name.localeCompare(b.name));
  // leagueGames.sort((a, b) => a.name.localeCompare(b.name));

  return countries;
};

const extractCountry__ = async (countryArray = [], fixtureArray = []) => {
  if (countryArray.length === 0 || fixtureArray.length === 0) return;

  let countries = [];

  // Add all countries from countryArray to the result
  for (let i = 0; i < countryArray.length; i++) {
    let countryName = countryArray[i].country.name;
    let countryFlag = countryArray[i].country.flag;
    countries.push({ name: countryName, flag: countryFlag, leagues: [] });
  }

  // Group fixtures by country and leagueName
  for (let i = 0; i < fixtureArray.length; i++) {
    let countryName = fixtureArray[i].league.country;
    let leagueName = fixtureArray[i].league.name;

    // Find the country in the countries array
    let country = countries.find((country) => country.name === countryName);
    if (!country) {
      // If the country doesn't exist, add it with an empty array for leagues
      country = { name: countryName, leagues: [] };
      countries.push(country);
    }

    // Check if the league exists in the country's leagues array
    let league = country.leagues.find((league) => league.name === leagueName);
    if (!league) {
      // If the league doesn't exist, add it to the leagues array with an empty array for fixtures
      league = { name: leagueName, fixtures: [] };
      country.leagues.push(league);
    }

    // Push the fixture into the corresponding league's fixtures array
    league.fixtures.push(fixtureArray[i]);
  }

  // Sort countries by name
  countries.sort((a, b) => a.name.localeCompare(b.name));

  return countries;
};

const prepareLiveGames = async (fixturesArray = [], preparedBetsArray = []) => {
  if (fixturesArray.length === 0 || preparedBetsArray.length === 0) return;

  const userTimeZone = "Africa/Lagos";
  let currentTime = moment().tz(userTimeZone);
  let livegamesArray = [];

  // Loop through the fixtures array and compare time difference
  for (let i = 0; i < fixturesArray.length; i++) {
    let fixturedate = fixturesArray[i].fixture.date;
    const matchTime = moment(fixturedate).tz(userTimeZone);
    const timeDiffMinutes = matchTime.diff(currentTime, "minutes");
    if (timeDiffMinutes < 0 && timeDiffMinutes > -120) {
      livegamesArray.push(fixturesArray[i]);
    }
  }

  let fixturesWithOdds = [];
  let fixturesWithoutOdds = [];

  // Compare the livegamesArray to the preparedBetsArray and return games with odds
  for (let i = 0; i < livegamesArray.length; i++) {
    let fixtureID = livegamesArray[i].fixture.id;
    let hasOdds = false;

    for (let j = 0; j < preparedBetsArray.length; j++) {
      if (fixtureID === preparedBetsArray[j].fixtureID) {
        fixturesWithOdds.push(preparedBetsArray[j]);
        hasOdds = true;
        break; // Exit the loop since we found the match
      }
    }

    if (!hasOdds) {
      fixturesWithoutOdds.push(livegamesArray[i]);
    }
  }

  // console.log("total fixtures => ", fixturesArray.length);
  // console.log("total prepared odds => ", preparedBetsArray.length);
  // console.log("live games => ", livegamesArray.length);
  // console.log("with odds => ", fixturesWithOdds.length);
  // console.log("without odds => ", fixturesWithoutOdds.length);

  return { withOdds: fixturesWithOdds, withoutOdds: fixturesWithoutOdds };
  // return fixturesWithOdds;
};

const prepareLiveGames2 = async (
  fixturesArray = [],
  preparedBetsArray = []
) => {
  if (fixturesArray.length === 0 || preparedBetsArray.length === 0) return;

  const userTimeZone = "Africa/Lagos";
  let currentTime = moment().tz(userTimeZone);
  let livegamesArray = [];

  fixturesArray.forEach((fixture) => {
    let games = fixture.games;
    for (let i = 0; i < games.length; i++) {
      // console.log("scanned =>", games[i].id);
      let fixturedate = games[i]?.date;
      const matchTime = moment(fixturedate).tz(userTimeZone);
      const timeDiffMinutes = matchTime.diff(currentTime, "minutes");
      if (timeDiffMinutes < 0 && timeDiffMinutes > -120) {
        console.log("is live =>", games[i].id);
        livegamesArray.push(games[i]);
      }
      // console.log("is not live=>", games[i].id);
    }
  });

  if (livegamesArray.length == 0) return { withOdds: [], withoutOdds: [] };

  let fixturesWithOdds = [];
  let fixturesWithoutOdds = [];

  let extractedBetsArray = [];

  preparedBetsArray.forEach((bet) => {
    let games = bet?.games;
    for (let i = 0; i < games.length; i++) {
      let game = games[i];
      extractedBetsArray.push(game);
    }
  });

  // Compare the livegamesArray to the preparedBetsArray and return games with odds
  for (let i = 0; i < livegamesArray.length; i++) {
    let fixtureID = livegamesArray[i].id;
    let hasOdds = false;

    for (let j = 0; j < extractedBetsArray.length; j++) {
      if (fixtureID === extractedBetsArray[j].fixtureID) {
        fixturesWithOdds.push(extractedBetsArray[j]);
        hasOdds = true;
        break; // Exit the loop since we found the match
      }
    }

    if (!hasOdds) {
      fixturesWithoutOdds.push(livegamesArray[i]);
    }
  }

  return { withOdds: fixturesWithOdds, withoutOdds: fixturesWithoutOdds };
};

const batchify = (batch_num = 1, sorted_array = []) => {
  // Function to split the array into batches of 5 items and return the batch based on the batch number
  batch_num = parseInt(batch_num);
  const batch_size = 5;
  const array_length = sorted_array.length;

  // Check if batch_num is valid
  if (typeof batch_num !== "number" || batch_num < 1) {
    throw new Error(
      "Invalid batch number. Batch number must be a positive integer."
    );
  }

  // Check if sorted_array is an array
  if (!Array.isArray(sorted_array)) {
    throw new Error("Invalid array. Please provide a valid array for sorting.");
  }

  // Calculate start and end indices for the batch
  const start_index = (batch_num - 1) * batch_size;
  const end_index = start_index + batch_size;

  // Check if start index is within bounds
  if (start_index >= array_length) {
    throw new Error(
      "Batch number exceeds array length. No items found for the specified batch."
    );
  }

  // Return the batch
  return sorted_array.slice(start_index, end_index);
};

module.exports = {
  prepareBet,
  groupByLeagueName,
  prepareTopLeagues,
  extractCountry,
  extractCountry2,
  prepareLiveGames,
  prepareLiveGames2,
  batchify,
  prepareBet2,
};
