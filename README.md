Single-page site to view and check off my running schedule from Nov 9, 2025 (post-Monumental) through Carmel Marathon (Apr 18, 2026) and Indy Mini (May 2, 2026).

Files

index.html – UI and layout

styles.css – styles

app.js – loads/renders the plan, saves checkmarks in localStorage

schedule.csv – the plan data (Date,Day,Phase,Workout,Distance,Notes)

Quick Start

Clone/download this repo.

Open index.html in a browser.

If your browser blocks local CSV fetch, run a tiny server:

Python: python -m http.server then visit http://localhost:8000

Deploy (GitHub Pages)

Push to GitHub.

Repo → Settings → Pages → Source: main, Folder: / (root) → Save.

Site appears at: https://<username>.github.io/<repo>/

Races & Goals

Monumental Half (Nov 8, 2025) – sub 1:35

5K (Dec 13, 2025) – sub 20:00

Carmel Marathon (Apr 18, 2026) – 3:18–3:20

Indy Mini (May 2, 2026) – sub 1:30

Pace Legend

E: 8:30–9:15/mi · T: 6:55–7:15/mi · M: 7:30–7:40/mi · I: 6:15–6:55/mi · LR: 8:15–9:00/mi

Customize

Edit plan in schedule.csv (keep the header exactly):

Date,Day,Phase,Workout,Distance,Notes


Theme: tweak CSS variables at the top of styles.css.

Notes

Checkmarks persist locally (per-browser) via localStorage.

Use “Reset checkmarks” in the footer to clear.
