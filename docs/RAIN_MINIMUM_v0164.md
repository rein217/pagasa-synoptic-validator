# v0.16.4-review - three-hour versus six-hour rainfall warning

- At main 00/06/12/18 UTC, compare the current exact six-hour amount with saved exact intermediate three-hour rainfall wholly inside that six-hour period at the same station.
- A smaller six-hour amount produces a warning, not a new error, because either entered amount may need correction. The warning identifies the saved intermediate amount and UTC endpoint.
- Equality or a larger six-hour amount passes this comparison. Integer tenths make a 0.1 mm difference detectable.
- This uses exact observer-entered amounts; rounded SYNOP amounts are not used as numeric lower bounds. Missing, invalid or trace-only prior quantities provide no numeric minimum. Current Trace against a prior positive measured amount produces a warning.
- At 00 UTC, the comparison covers 18-24 UTC and its preceding 21 UTC intermediate record, including date/month/year boundaries.
- Three-hour amounts remain separate and are never added again to six-hour totals. No records are changed automatically by this warning.
- Existing occurrence, coded-amount, pressure, cloud, visibility, duplicate and group-order checks remain active.
