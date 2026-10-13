PAGASA SYNOP Validator

Ruleset v0.16.1-review

Rainfall popup and saved-record cross-checks. This addendum takes precedence over the attached v0.16.0 review rules for the changes described here.

Simple rainfall review

Review rainfall / saved records opens a separate popup. At 00 UTC, it displays the four six-hour periods for the preceding UTC day. At other hours it displays the current UTC day so far; future periods cannot be edited. Records are separated by station and explicit UTC date. Save and close stores completed-period amounts locally; validate the observation afterward.

Occurrence evidence

Manually confirmed rainfall and usable coded rainfall amounts are saved as supporting evidence with their accumulation period. Intermediate evidence wholly inside the next main report period checks for a contradictory zero or absent rainfall group. At 00 UTC, evidence within the preceding 24 hours cross-checks the scheduled 6RRR4 and Section 3 7RRRR groups. Missing groups produce a review warning; a zero amount conflicting with saved rain produces an error. These checks never select the manual rainfall checkbox or require present weather solely because rain occurred earlier in the day.

Amounts and incomplete records

Only exact six-hour amounts are added to form the 24-hour total. Intermediate amounts are not added again. Missing is distinct from zero and Trace; incomplete periods cannot fully verify a total. A mixed trace and measurable-rain day requires a confirmed measured total. Historical evidence does not establish the timing of rainfall inside an interval that extends outside the target period.

Retention and limits

Pressure history remains eligible for 36 hours; rainfall remains available for 8 days in this browser. This update does not add monthly accumulation, export/import, cloud sharing, or a permanent archive. Existing pressure, cloud, visibility, CB, gust, duplicate and group-order rules are retained.