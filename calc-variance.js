import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

// Helper function to generate combinations
function getCombinations(array, size) {
  function combinations(arr, size, start, initialStuff, output) {
    if (initialStuff.length >= size) {
      output.push(initialStuff);
    } else {
      for (let i = start; i < arr.length; ++i) {
        combinations(arr, size, i + 1, initialStuff.concat(arr[i]), output);
      }
    }
  }
  const output = [];
  combinations(array, size, 0, [], output);
  return output;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvFilePath = path.join(__dirname, 'NBA-Schedule25.csv');
const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true
});

// Extract unique teams
const teams = new Set();
for (const game of records) {
  const visitor = game['Visitor/Neutral'].trim().replace(/"/g, '');
  const home = game['Home/Neutral'].trim().replace(/"/g, '');
  teams.add(visitor);
  teams.add(home);
}

const uniqueTeams = Array.from(teams);

// Simulate a fantasy roster of 14 players
function generateRoster(numPlayers, teams) {
  const roster = [];
  for (let i = 0; i < numPlayers; i++) {
    const team = teams[Math.floor(Math.random() * teams.length)];
    roster.push({ playerId: i + 1, team });
  }
  return roster;
}

const roster = generateRoster(14, uniqueTeams);

// Define the week to analyze: Dec 2, 2024 (Mon) to Dec 8, 2024 (Sun)
function getDatesForWeek(startDateStr, numDays = 7) {
  const dates = [];
  const startDate = new Date(startDateStr);
  for (let i = 0; i < numDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const formatted = d.toISOString().split('T')[0]; // YYYY-MM-DD
    dates.push(formatted);
  }
  return dates;
}

// Monday to Sunday week range for Dec 2 - Dec 8, 2024
const weekDates = getDatesForWeek('2024-12-02', 7);

// Map each day of the week to a short code
const dayCodes = ["M", "T", "W", "TH", "F", "SA", "SU"];

// Parse game dates
function parseGameDate(dateStr) {
  const cleaned = dateStr.replace(/"/g, '').trim();
  const date = new Date(cleaned);
  return date.toISOString().split('T')[0];
}

const gamesByDate = {};
for (const game of records) {
  const gameDate = parseGameDate(game['Game Date']);
  const visitorTeam = game['Visitor/Neutral'].trim().replace(/"/g, '');
  const homeTeam = game['Home/Neutral'].trim().replace(/"/g, '');

  if (!gamesByDate[gameDate]) {
    gamesByDate[gameDate] = [];
  }
  gamesByDate[gameDate].push({ visitorTeam, homeTeam });
}

// Determine which players play on a given day
function playersPlayingOnDate(givenRoster, gameList) {
  const playingPlayers = [];
  for (const player of givenRoster) {
    const hasGame = gameList.some(game => game.visitorTeam === player.team || game.homeTeam === player.team);
    if (hasGame) playingPlayers.push(player);
  }
  return playingPlayers;
}

const DAILY_START_LIMIT = 10;
const totalWeeklySlots = 7 * DAILY_START_LIMIT; // 70

// Calculate totals for a given roster configuration
function calculateRosterTotals(givenRoster) {
  let totalPlayerGames = 0;
  let totalStarted = 0;
  for (const [idx, date] of weekDates.entries()) {
    const gameList = gamesByDate[date] || [];
    const playingPlayers = playersPlayingOnDate(givenRoster, gameList);
    const playerCount = playingPlayers.length;
    totalPlayerGames += playerCount;
    const startedToday = Math.min(playerCount, DAILY_START_LIMIT);
    totalStarted += startedToday;
  }
  return { totalPlayerGames, totalStarted };
}

// Calculate initial totals
const { totalPlayerGames, totalStarted } = calculateRosterTotals(roster);

// Calculate initial percentage based on 70 total slots
const initialPercentage = (totalStarted / totalWeeklySlots) * 100;

// Output initial results
console.log(`Week Range: December 2, 2024 (Mon) - December 8, 2024 (Sun)`);
console.log(`Total roster spots over the week: ${totalWeeklySlots} slots (7 days * 10 slots/day)`);
console.log(`Total Player-Games this week: ${totalPlayerGames}`);
console.log(`Total Started: ${totalStarted}`);
console.log(`Percentage of Theoretical Max Slots Used (vs. 70): ${initialPercentage.toFixed(2)}%`);

// Collect team stats
const teamStats = {};
for (const t of uniqueTeams) {
  teamStats[t] = {
    rosterCount: 0,
    gamesCount: 0,
    daysPlayed: new Set()
  };
}

for (const player of roster) {
  if (teamStats[player.team]) {
    teamStats[player.team].rosterCount += 1;
  }
}

// Determine games and days for each team
weekDates.forEach((date, idx) => {
  const gameList = gamesByDate[date] || [];
  for (const game of gameList) {
    const { visitorTeam, homeTeam } = game;
    if (teamStats[visitorTeam]) {
      teamStats[visitorTeam].gamesCount += 1;
      teamStats[visitorTeam].daysPlayed.add(dayCodes[idx]);
    }
    if (teamStats[homeTeam]) {
      teamStats[homeTeam].gamesCount += 1;
      teamStats[homeTeam].daysPlayed.add(dayCodes[idx]);
    }
  }
});

console.log("\nTeams on the simulated roster and their weekly stats:");
for (const team of uniqueTeams) {
  const { rosterCount, gamesCount, daysPlayed } = teamStats[team];
  const sortedDays = dayCodes.filter(d => daysPlayed.has(d));
  const daysString = sortedDays.join('-') || "No games this week";

  console.log(`Team: ${team}`);
  console.log(`  Games This Week: ${gamesCount}`);
  console.log(`  Roster Players: ${rosterCount}`);
  console.log(`  Days Played: ${daysString}`);
}

// For daily player count just for display
console.log("\nDaily Roster Player Count:");
weekDates.forEach((date, idx) => {
  const gameList = gamesByDate[date] || [];
  const playingPlayers = playersPlayingOnDate(roster, gameList);
  console.log(`${dayCodes[idx]}: ${playingPlayers.length} players with a game`);
});

// Now let's try to find replacements that increase totalStarted
// We'll try replacing combinations of up to MAX_REPLACEMENTS players
const MAX_REPLACEMENTS = 2; // Set to 2 as per your request

// Get combinations of players to replace
const playerIndices = roster.map((_, index) => index);
const replacementCombos = getCombinations(playerIndices, MAX_REPLACEMENTS);

// Get list of possible replacement teams (teams not already on the roster)
const rosterTeams = new Set(roster.map(player => player.team));
const possibleReplacementTeams = uniqueTeams.filter(team => !rosterTeams.has(team));

// Prepare to collect improvement scenarios
const improvementScenarios = [];

// For each combination of players to replace
for (const combo of replacementCombos) {
  // Get current teams of players to replace
  const oldTeams = combo.map(index => roster[index].team);

  // Get combinations of new teams for replacements
  const replacementTeamCombos = getCombinations(possibleReplacementTeams, MAX_REPLACEMENTS);

  for (const newTeams of replacementTeamCombos) {
    // Create a new roster scenario
    const newRoster = [...roster];

    // Replace players in the combo with new teams
    combo.forEach((playerIndex, idx) => {
      newRoster[playerIndex] = { playerId: roster[playerIndex].playerId, team: newTeams[idx] };
    });

    const { totalStarted: newTotalStarted } = calculateRosterTotals(newRoster);

    if (newTotalStarted > totalStarted) {
      improvementScenarios.push({
        replacedPlayerIds: combo.map(i => roster[i].playerId),
        oldTeams: oldTeams,
        newTeams: newTeams,
        oldTotalStarted: totalStarted,
        newTotalStarted,
        gain: newTotalStarted - totalStarted
      });
    }
  }
}

// If we have improvement scenarios, we only output those with the highest gain
if (improvementScenarios.length > 0) {
  const maxGain = Math.max(...improvementScenarios.map(s => s.gain));
  const bestScenarios = improvementScenarios.filter(s => s.gain === maxGain);

  console.log(`\nBest Improvement Scenarios (Max Gain: +${maxGain}):`);
  for (const scenario of bestScenarios) {
    const replacedPlayersInfo = scenario.replacedPlayerIds.map((id, idx) => {
      return `Player #${id} (Team: ${scenario.oldTeams[idx]} -> ${scenario.newTeams[idx]})`;
    }).join(', ');
    console.log(
      `Replace ${replacedPlayersInfo}, Starts increase from ${scenario.oldTotalStarted} to ${scenario.newTotalStarted} (+${scenario.gain})`
    );
  }
} else {
  console.log(`\nNo replacement scenario found that would increase total starts with up to ${MAX_REPLACEMENTS} replacements.`);
}
