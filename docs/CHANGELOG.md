# Change log

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
