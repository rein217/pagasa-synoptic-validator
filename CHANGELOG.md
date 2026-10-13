# Change log

## v0.16.5 - observation alarm release (13 October 2026)

Layout revision 2: alarm toolbar/reminder span the page grid; code stays on the left and findings on the right on desktop. CSS cache revision updated.

Approved after review on the third Site. New configurable alarm is OFF by default.

- Station selection, 1-120 minute delay (default 8), and main-only or all three-hourly schedule, in UTC.
- Explicit Validate entry acknowledges the matching station/date/time, including reports with findings. Old input text, sample loading and another station do not.
- Dismiss one observation, Snooze five minutes, or switch OFF. No retroactive reminders upon activation or station/schedule/delay changes.
- Urgent beeps (default), Ringing alarm, Chime and uploaded MP3/WAV up to 1 MB, with preview and stop-preview controls.
- Built-in sounds repeat every five seconds. Uploaded sounds play up to thirty seconds and repeat after playback plus one second, with at least five seconds between starts.
- Settings and audio saved only in this browser on this site. No audio upload to a server. Invalid audio and storage failures are explained.
- Browser must remain open and awake; background timers may be delayed. Reload may require Preview sound to enable audio.
- Alarm instructions and v0.16.4 announcement included in the current ruleset PDF. Relative PDF links support GitHub Pages.

All v0.16.4 meteorological rules, history keys and retention are preserved. Existing main-site pressure and rainfall history are not migrated or cleared. The v0.17.0-review monthly trial remains on the secondary Site.

Verification: four regression suites, including alarm sound/upload/storage behavior. Device sound and browser visual QA require user review.


## v0.16.4 - released update

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


## v0.16.4-review - three-hour versus six-hour rainfall warning

- At main 00/06/12/18 UTC, compare the current exact six-hour amount with saved exact intermediate three-hour rainfall wholly inside that six-hour period at the same station.
- A smaller six-hour amount produces a warning, not a new error, because either entered amount may need correction. The warning identifies the saved intermediate amount and UTC endpoint.
- Equality or a larger six-hour amount passes this comparison. Integer tenths make a 0.1 mm difference detectable.
- This uses exact observer-entered amounts; rounded SYNOP amounts are not used as numeric lower bounds. Missing, invalid or trace-only prior quantities provide no numeric minimum. Current Trace against a prior positive measured amount produces a warning.
- At 00 UTC, the comparison covers 18-24 UTC and its preceding 21 UTC intermediate record, including date/month/year boundaries.
- Three-hour amounts remain separate and are never added again to six-hour totals. No records are changed automatically by this warning.
- Existing occurrence, coded-amount, pressure, cloud, visibility, duplicate and group-order checks remain active.


## v0.16.3-review — rainfall date-label revision

- Replaced numeric rainfall period dates with month names, e.g. October 15, 0000–0600 UTC.
- Midnight-crossing periods show both dates; year-crossing periods also show both years.
- The review heading includes the year. All times remain UTC; validation and retention rules are unchanged.


## v0.16.3-review - conditional exact rainfall and period-specific auto-selection

- Exact rainfall appears directly below the checkbox only while checked.
- Auto-selection uses positive or trace rainfall for the current period: intermediate Section 3 6RRR7; main 06/12/18 UTC Section 1 6RRR1; 00 UTC Section 5 2RRRR covering 18-24 UTC. Zero, missing, wrong-duration and 24-hour-only groups do not auto-select.
- Manual overrides remain possible and are preserved during edits while the matching rainfall groups stay unchanged. A new observation re-evaluates the matching code.
- T or Trace, case insensitive, are accepted as trace.
- Three-hour values remain separate from six-hour totals. Saved review stays in the popup. Existing pressure, cloud, visibility, structure and history rules are retained.


## v0.16.2-review - report-dependent rainfall input

- The checkbox caption follows the observation: main 00/06/12/18 UTC = previous 6 hours; intermediate 03/09/15/21 UTC = previous 3 hours.
- Exact rainfall appears directly below the checkbox with the same duration. It remains available for explicit zero or Trace and does not auto-select the checkbox.
- Intermediate exact amounts are compared with Section 3 6RRR7 and saved as rain3; main amounts remain rain6.
- Intermediate quantities are supporting occurrence evidence, never added again to six-hour totals. Manually confirmed intermediate evidence now uses a three-hour interval.
- The popup remains for saved six-hour records and 24-hour review. Pressure retention is 36 hours; rainfall retention is 8 days.


## v0.15.0 rainfall correction

- Preserved the approved v0.15.0 CB, visibility, duplicate-family, pressure,
  and local-history changes.
- Reverted only automatic rainfall-checkbox selection.
- Defined the checkbox as rainfall during the previous six hours and reset it
  when the YYGGi/station observation identity changes.
- Preserved the answer while correcting groups within the same observation.
- Added correct RRR decoding: `60074` is 7 mm with `tR=4`; `990` is trace;
  and `991` through `999` represent 0.1 through 0.9 mm.
- Added a mobile-friendly **Copy code** button.
- Added Section 1 indicator-order validation, including a 2-group placed
  before a 1-group.
- Added detection of a second Nddff-shaped group after the mandatory wind
  position, including the reported `70701 23602` case.

## v0.15.0 reviewed branch update

- Preserved the collaborator's separated project structure and added
  main/intermediate bulletin validation (`SMPH20`/`SIPH20`).
- Preserved 36-hour browser-local MSLP history and prevented false pressure
  mismatches when the required previous MSLP is unavailable.
- Limited saved MSLP records to one structurally valid, operationally plausible
  `4PPPP` group and documented browser/device limitations.
- Centralized rainfall evidence so the UI and validator use the same rule.
- Excluded `6000t`, `6////`, and snow-only evidence from definite rainfall
  autofill, and preserved manual checkbox choices.
- Restored the v0.14.3 boundaries: heavy precipitation and `ww=40` accept
  visibility up to and including 2 km.
- Removed the unsupported hard upper visibility limit for `ww=04-06`.
- Expanded `949CD` to accept C=4, 5, 6, and 7, including combined Cumulus and
  Cumulonimbus reports such as `94968`.
- Added semantic duplicate detection, including different competing `1snTTT`
  values such as `10313 10312`.
- Restored the negative high-cloud-obscuration regression case and retained the
  valid PAGASA colloquium case.
- Added regression reports supplied during operational review and updated the
  webpage, guide, ruleset document, and cache-version strings.

## v0.14.2 site-document update

- Made the header Ruleset v0.14.2 badge clickable.
- Added an in-site ruleset viewer page.
- Added a direct PDF download option for operational review.

## v0.14.2-separated

- Fixed email feedback not opening on some browsers and hosted pages.
- Replaced direct page navigation with an actual `mailto:` link click.
- Shortened the email draft to avoid mail-handler URL-length limits.
- Added a visible confirmation and clipboard fallback when no default email
  application is configured.

## v0.14.1-separated

- Added a **Report checker issue** button for operational feedback.
- The button opens the user's default email application with a draft addressed
  to `renieragas@gmail.com`.
- The draft includes the entered SYNOP code, ruleset version, validation
  summary, findings, and choices for a missed error or a false error flag.
- The webpage does not send or store the observation automatically; the user
  reviews the draft before sending it.

## v0.14-separated

- Aligned the cloud-layer amount check with the 2023 PAGASA amended SSO
  guidelines: individual `Ns` values are estimated as if other layers did not
  exist and are no longer added to derive `Nh`.
- Added the official overlapping-layer regression example (`Nh=5`, 3 oktas
  Cumulus, 4 oktas Stratocumulus).
- Expanded combined cloud-type mappings, including `CL=8` for both Cumulus and
  Stratocumulus and `CM=7` for Ac with As/Ns.
- Added omission and vertical-visibility rules for `N=0`, `N=9`, and `N=/`.
- Limited the Section 1 `h` comparison to the lowest reported low-cloud layer.
- Restored the first site's visible layout and wording while retaining the
  separated ruleset architecture.

## v0.13.1-separated

- Fixed a browser startup failure caused by duplicate global names in
  `ruleset.js` and `app.js`.
- Wrapped the page controller in a private scope.
- Added a regression test that loads all three scripts in browser order.

## v0.13-separated

- Separated editable rule settings into `ruleset-config.js`.
- Separated parsing and meteorological validation into `ruleset.js`.
- Reduced `app.js` to webpage controls and result rendering.
- Added beginner-oriented comments and a ruleset editing guide.
- Preserved the v0.12 validation behavior and regression examples.
