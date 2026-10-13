# v0.16.4 - released update

Released 12 October 2026 after user review of v0.16.4-review. The release removes the review suffix and operational-draft label without changing the tested meteorological behavior.

Includes all v0.16.0-v0.16.4 review updates:

- Editable-input error and warning highlights, Copy code and feedback reporting.
- Separate station pressure and MSLP history, station-pressure basis for Tayabas/Tanay, corrected pressure decoding and exact 0.1 hPa comparisons.
- Explicit UTC observation date; local pressure retention of 36 hours and rainfall retention of 8 days.
- Three-hour intermediate and six-hour main captions, conditional exact input directly below the checkbox, T/Trace support and period-specific auto-selection with manual override.
- At 00 UTC, auto-selection uses Section 5 2RRRR for 18-24 UTC, not 24-hour totals.
- Rainfall review popup with readable month-name UTC labels and four six-hour periods.
- Saved rainfall-occurrence checks for the next main report and the 00 UTC report; no intermediate amount is counted twice.
- Warning when the exact main six-hour amount is below a saved exact intermediate three-hour amount within the same period at the same station.
- Existing cloud, CB, gustiness, visibility, group-order and duplicate checks preserved.
- Current consolidated ruleset PDF and separated, commented source.

Verification: all three regression suites pass, including history, lower-bound warnings, boundary dates and page-controller tests. Browser visual QA is unavailable in this environment.
