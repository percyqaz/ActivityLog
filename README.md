# What's this?

I'm currently learning TypeScript/Express/JavaScript/React

This project is an excuse to use those things while completing my rube goldberg machine of scripts to track how I use my computer, here's how it works:

- An AutoHotkey script grabs the current active window title every 10 seconds, and logs it to a file (will be added to this repo soon)
- A TypeScript/Express API scans the log file and parses active window titles to categorise things as activities
  Features of this API:
    - Breakdown of a single day
    - Todo: Timeline of a single day
    - Todo: Breakdown overall or within a given time period
    - Todo: Timeline within a given time period
- A JavaScript/React app connects to this API and displays the data (It may not look very pretty but learning react is the main focus)
  Features of the app:
    - Selecting days and displaying the breakdown
    - Todo: Displaying the breakdown as a pie chart or with prettier colors
    - Todo: Timeline display (also with pretty colors)
    - Todo: Selecting ranges other than days

Overall I will have a web app that lets me get insights on my habits so I can:
- Look at the pretty data
- Evaluate how much time I waste doing certain things
- Read and understand React codebases
