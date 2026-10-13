Review ruleset v0.16.0-review

PAGASA SYNOP Validator | 11 October 2026

This review release extends the GitHub v0.15.0 baseline. The following addendum takes precedence where behavior changes. The complete v0.15.0 ruleset follows for all unchanged meteorological checks.

Pressure basis and required groups

Tayabas (98427) and Tanay (98433) use station pressure from Section 1 3P0P0P0P0 for both the 3-hour 5appp check and the 24-hour 58/59 check, following the practices supplied by the station reviewer. Other stations retain MSLP as their comparison basis.

Station pressure and MSLP are decoded and saved separately. Comparisons require the same station, UTC observation time and pressure basis. A missing previous value produces an unavailable-comparison warning, not a numerical mismatch. Differences must agree exactly to 0.1 hPa.

A usable station-pressure group is required at main observation times and at every observation for the two configured stations. Format and duplicate checks remain active. Values outside 500-1100 hPa are errors. Broad elevation-aware review ranges warn outside 850-1085 hPa for Tayabas and 800-1020 hPa for Tanay. These are review settings, not instrument calibration limits.

Pressure decoding below 1000 hPa

The thousands digit is omitted in the pressure group. For example, 39917 is 991.7 hPa. This release corrects a baseline decoding error for pressure values below 1000 hPa.

Highlights inside the editable code

After validation, errors have red backgrounds and warnings have amber backgrounds behind the original editable text. Clicking or keyboard-activating a finding selects the first affected token. Missing groups have no text to mark and remain explained in the findings. Editing the report clears old highlights until it is validated again. Copy returns plain original text.

Exact rainfall and history

At 00, 06, 12 and 18 UTC the observer can enter the exact previous-six-hour rainfall to 0.1 mm, including measured zero or Trace. The amount does not select the previous-six-hour weather checkbox. That checkbox remains manual and resets only when a different observation is entered.

At 00 UTC the review lists four nonoverlapping six-hour periods ending at 06, 12, 18 and 00 UTC. The periods are matched by station and full UTC date. The observer can review and edit entries before saving. Missing periods cannot be treated as zero.

When every period has a numeric measured amount, the page sums integer tenths and compares the result with the Section 1 6RRR4 and Section 3 7R24R24R24R24 groups. A separately entered measured 24-hour total must agree with a complete numeric sum. A measured total can provide a comparison when historical periods are missing, but it does not make those periods complete.

Trace remains distinct from zero. A day with only zero and trace entries is a trace day. Mixed trace and measurable rain requires a measured 24-hour total because trace has no exact numeric amount. Section 5 2RRRR at 00 UTC is checked against the exact six-hour amount. At 06/12/18 UTC the scheduled Section 1 6RRR1 group is checked instead.

RRR coding: 990 is trace, 991-999 are 0.1-0.9 mm and numeric amounts of 1 mm or more use whole millimetres. The 24-hour 7-group retains tenths of a millimetre. Saturation codes are handled separately from literal amounts.

Local retention and date checks

Pressure readings remain eligible for 36 hours after saving. Exact rainfall remains eligible for 8 days. Both use this browser profile on this site and do not sync between computers. An explicit UTC observation date must match the day in AAXX, which has no month or year. Confirm the suggested date before saving.

Closing the normal browser or restarting normally preserves saved local history. Clearing site data, using private browsing, storage restrictions or changing browser/device/site domain can remove it or make it unavailable. The saved history is not a backup of the complete SYNOP text.

Scope and sources

Monthly rainfall accumulation is deferred. Existing monthly group format and reporting-time checks remain in the baseline. The page cannot verify observations that were not entered or measurements that the observer has not confirmed.

GitHub baseline: rein217/pagasa-synoptic-validator, main commit b90a4ca1541e44aa34846ba3838fba1e98424a28. Station identifiers: PAGASA WIS2 station collection at wis.pagasa.dost.gov.ph/oapi/collections/stations/items. Browser storage: developer.mozilla.org/en-US/docs/Web/API/Window/localStorage. Pressure-group definition: WMO Manual on Codes, FM 12, 12.2.4.