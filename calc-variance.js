import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvFilePath = path.join(__dirname, 'NBA-Schedule25.csv');
const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true
});

//console.log(records);

// Extract unique teams
const teams = new Set();
for (const game of records) {
  const visitor = game['Visitor/Neutral'].trim().replace(/"/g, '');
  const home = game['Home/Neutral'].trim().replace(/"/g, '');
  teams.add(visitor);
  teams.add(home);
}

const uniqueTeams = Array.from(teams);

// Simulate a fantasy roster of 14 players, each assigned randomly to a team
function generateRoster(numPlayers, teams) {
  const roster = [];
  for (let i = 0; i < numPlayers; i++) {
    const team = teams[Math.floor(Math.random() * teams.length)];
    roster.push({ playerId: i + 1, team });
  }
  return roster;
}

const roster = generateRoster(14, uniqueTeams);

// Define the week to analyze
// Example: Monday, October 21, 2024 to Sunday, October 27, 2024
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

// Adjust the start date as per the schedule you want to analyze
const weekDates = getDatesForWeek('2024-10-21', 7);

// Function to parse game dates into a normalized YYYY-MM-DD format
function parseGameDate(dateStr) {
  // Example input format: "Tue, Oct 22, 2024"
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
function playersPlayingOnDate(roster, gameList) {
  const playingPlayers = [];
  for (const player of roster) {
    const hasGame = gameList.some(game => game.visitorTeam === player.team || game.homeTeam === player.team);
    if (hasGame) playingPlayers.push(player);
  }
  return playingPlayers;
}

const DAILY_START_LIMIT = 10;
let totalPlayerGames = 0;
let totalStarted = 0;

for (const date of weekDates) {
  const gameList = gamesByDate[date] || [];
  const playingPlayers = playersPlayingOnDate(roster, gameList);
  const playerCount = playingPlayers.length;

  totalPlayerGames += playerCount;
  const startedToday = Math.min(playerCount, DAILY_START_LIMIT);
  totalStarted += startedToday;
}

// Calculate and display the percentage
const percentage = totalPlayerGames === 0 ? 0 : (totalStarted / totalPlayerGames) * 100;

console.log("Unique Teams in Schedule:", uniqueTeams);
console.log("Simulated Roster:", roster);
console.log("Total Player-Games this week:", totalPlayerGames);
console.log("Total Started:", totalStarted);
console.log("Percentage of Available Game Slots Used:", percentage.toFixed(2) + "%");
