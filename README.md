# PAGASA SYNOP Validator v0.16.5

GitHub Pages package of the released ChatGPT Site, including the configurable observation alarm and all changes since v0.15. Based on GitHub main b90a4ca1541e44aa34846ba3838fba1e98424a28, then the review updates described in CHANGELOG.md.

## Start here

Released 13 October 2026 after user review. Read `docs/RELEASE_v0.16.5.md` and `UPLOAD_TO_GITHUB.md`. Upload the contents of this package into the repository root. `index.html` and `ruleset.html` belong beside `dist/`, not inside another package folder.

This static site needs no installation or build step. GitHub Pages can serve main / (root). For local use, open index.html or use any static web server. No user data is included in this package.

## Current features

- Separated, commented rule configuration and validation engine.
- Input highlights; Copy code and email issue-report controls.
- Tayabas/Tanay station-pressure comparison and history; other stations use MSLP.
- Exact 3-hour and 24-hour pressure changes; missing history does not become a false mismatch.
- Full UTC observation date; 36-hour pressure and 8-day rainfall history in the current browser.
- Rainfall checkbox captions: 3 hours for intermediate reports, 6 hours for main reports.
- Exact rainfall appears below the checkbox only while checked; T and Trace are accepted.
- Auto-selection only for matching current-period rainfall. At 00 UTC this uses Section 5 2RRRR for 18-24 UTC, never a 24-hour total alone. Manual overrides remain available.
- Separate exact intermediate rainfall, saved occurrence evidence, six-hour records and four-period 24-hour review popup.
- Readable UTC periods such as October 15, 0000–0600 UTC; both dates are shown at midnight crossings.
- Preserved cloud, CB 949 codes 4-7, weather/visibility, gust, duplicate and group-order checks.
- Clickable ruleset with the current v0.16.5 PDF in dist/pdf/.

## Files and checks

`dist/js/ruleset-config.js` contains settings; `ruleset.js` contains the rule engine; `history.js` contains local history; `app.js` contains page controls. See RULESET_GUIDE.md.

With Node.js installed, run:

```
node tests/ruleset-regression.test.mjs
node tests/review-features.test.mjs
node tests/cloud-regression.test.mjs
node tests/alarm.test.mjs
```

All four suites passed for this package. A six-hour exact amount below a saved exact three-hour amount in the same period gives a warning to review both entries. Browser visual QA was unavailable. Browser history is separate for each site origin; records from the ChatGPT Site do not automatically appear on GitHub Pages. Monthly accumulation and backup import/export are not yet implemented.

## New observation alarm

Alarm is OFF by default. Open Alarm settings, enter the station, delay and schedule, select a sound, preview it, switch ON and save. Built-ins repeat every five seconds; uploaded MP3/WAV (up to 1 MB) repeats after playback. Dismiss, Snooze, OFF, or explicit Validate entry of the matching observation stops the reminder. Keep the page open and computer awake.

See docs/RELEASE_v0.16.5.md and the current PDF. The package includes all v0.16.4 features, so a separate older upload is unnecessary. Saved pressure/rainfall records survive replacement of files when the GitHub Pages origin and browser storage stay the same. Alarm settings/audio are browser-local.
