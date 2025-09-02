# Run_Log

A simple run logger with data visualization based on form input tracked over time. This project is a single static HTML page that uses Tailwind CSS and Chart.js (via CDN). Data is stored locally in your browser using localStorage.

## Features

- Log runs with:
  - Distance (miles)
  - Pace (min/mile, e.g. 8:30)
  - Run type (easy, tempo, long)
  - Surface (road, trail)
- Live dashboard:
  - This week’s mileage, plus road/trail breakouts
  - All‑time road/trail totals and a combined total
- Charts (Chart.js):
  - 8‑week weekly mileage trend (line chart)
  - Surface distribution (doughnut)
  - Run type distribution (doughnut)
- Recent runs table with delete actions
- Data persists in your browser via localStorage

## Quick start

This is a zero-build static page. You can open it directly or serve it locally:

- Option A: Open directly
  - Double-click `index.html` to open in your browser.
  - Note: The page pulls Tailwind and Chart.js from CDNs, so you’ll need an internet connection.

- Option B: Serve locally (recommended)
  - Python
    ```bash
    python3 -m http.server 5173
    ```
    Then open http://localhost:5173/index.html
  - Node (http-server)
    ```bash
    npx http-server -p 5173 .
    ```
    Then open http://localhost:5173/index.html

## Usage

1. Add a run using the form (distance, pace, type, surface) and click “Add Run”.
   - The date/time is set automatically to “now”.
2. The dashboard updates stats and charts immediately.
3. Use the “Delete” button in the Recent Runs table to remove an entry.

### Data storage
- All runs are saved in `localStorage` under the `runs` key in your browser.
- To clear all saved runs, you can:
  - Use your browser devtools (Application/Storage > Local Storage) and remove the `runs` key, or
  - In the browser console, run: `localStorage.removeItem('runs')`.

### Mock data (optional)
If you want to prefill the app with roughly four weeks of sample data, you can uncomment the mock data block in `test.html` (search for “Add mock data if no runs exist”). It looks like this:

```js
// Add mock data if no runs exist
// if (runs.length === 0) {
//     const mockRuns = generateMockData();
//     runs = mockRuns;
//     localStorage.setItem("runs", JSON.stringify(runs));
// }
```

## Tech
- Tailwind CSS via CDN
- Chart.js via CDN
- Vanilla JS + localStorage

## Project structure
```
Run_Log/
├─ index.html       # Entry point (UI, markup)
├─ script.js        # App logic, charts, storage
├─ styles.css       # Custom styles (e.g., chart container)
└─ README.md        # This file
```

## Notes
- Because styles and charts are loaded from CDNs, an internet connection is required.
- For static hosting (e.g., GitHub Pages), `index.html` serves as the default page.

## Acknowledgements
- [Tailwind CSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)

