NBA Schedule Variance Calculator

This project is a tool to analyze and optimize the weekly schedule of a fantasy basketball roster. The program calculates the effectiveness of a roster's schedule in utilizing available game slots and identifies potential improvements by simulating player replacements.
Features

    Analyze Weekly Schedule:
        Calculate the total games your rostered players are scheduled to play in a given week.
        Determine how many games can be started, considering the 10-player daily start limit.

    Optimize Roster:
        Identify up to two player replacements to maximize the number of starts for the week.
        Output scenarios that yield the highest possible gain in starts.

    Detailed Reporting:
        Weekly summary of total games, total starts, and utilization percentage.
        Breakdown of each team's contribution to the schedule and the days they play.
        Daily counts of players scheduled for games.

Requirements

    Node.js (v14+ recommended)

Installation

    Clone the repository:

git clone https://github.com/yourusername/nba-schedule-variance-calculator.git
cd nba-schedule-variance-calculator

Install dependencies:

npm install

Ensure your NBA-Schedule25.csv file is in the project directory. This file should contain the NBA schedule in the required format:

    Game Date,Start (ET),Visitor/Neutral,Home/Neutral,Arena,Notes
    "Tue, Oct 22, 2024",7:30p,New York Knicks,Boston Celtics,TD Garden,

Usage

    Run the script:

    node calc-variance.js

    View the output in your terminal. The script will:
        Provide a summary of the initial roster schedule.
        Suggest optimal player replacements that maximize weekly starts.

    Modify MAX_REPLACEMENTS in the script to change the number of players to consider for replacement (default is 2).

Configuration

    Modify the Roster: The roster is generated randomly in the script. To use a specific roster, replace the generateRoster function with your own logic.
    Adjust the Week: The week range is set to December 2, 2024 – December 8, 2024, but you can modify the getDatesForWeek function to analyze other weeks.

Example Output

Week Range: December 2, 2024 (Mon) - December 8, 2024 (Sun)
Total roster spots over the week: 70 slots (7 days * 10 slots/day)
Total Player-Games this week: 50
Total Started: 47
Percentage of Theoretical Max Slots Used (vs. 70): 67.14%

Teams on the simulated roster and their weekly stats:
Team: Boston Celtics
  Games This Week: 3
  Roster Players: 2
  Days Played: T-W-F

Team: Miami Heat
  Games This Week: 2
  Roster Players: 1
  Days Played: W-SA

...

Best Improvement Scenarios (Max Gain: +3):
Replace Player #1 (Team: Boston Celtics -> Los Angeles Lakers), Player #2 (Team: Miami Heat -> Milwaukee Bucks), Starts increase from 47 to 50 (+3)

Contribution

Contributions are welcome! If you have ideas for improvements or bug fixes, please fork the repository and submit a pull request.
License

This project is licensed under the MIT License. See the LICENSE file for details.