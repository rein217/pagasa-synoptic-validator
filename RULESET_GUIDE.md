# Ruleset editing guide

Current version: v0.16.5, including readable UTC rainfall labels.

- `dist/js/ruleset-config.js`: version, schedules, pressure basis and configurable values.
- `dist/js/ruleset.js`: parsing, meteorological checks and current-period rainfall evidence.
- `dist/js/history.js`: browser-local storage, dates, measured amounts and retention.
- `dist/js/app.js`: page controls, highlights, captions and rainfall popup.
- `dist/css/styles.css`: appearance.

Each JavaScript file includes comments explaining its role and batches of logic. Keep meteorological decisions in the ruleset rather than the page controller.

When changing a rule, add an operational example to the regression tests, update the version and asset cache suffix, and revise the ruleset PDF and HTML. The current PDF includes chronological addenda; the newest addendum takes precedence.

Exact input is below the checkbox and appears only while checked. Main reports use six hours, intermediates three hours. Matching current-period rainfall auto-selects the checkbox; a 24-hour total alone does not. T and Trace are accepted. Three-hour exact values remain separate from six-hour totals.

- `dist/js/alarm.js`: separate nonmeteorological observation reminders, audio and alarm settings. The alarm never changes findings in the validation engine.
