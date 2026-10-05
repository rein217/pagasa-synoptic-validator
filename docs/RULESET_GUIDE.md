# Beginner guide to the separated ruleset

The website is divided into three JavaScript files so that operational rules can be reviewed without touching the page controls.

## 1. `dist/ruleset-config.js`

Start here for routine policy changes. It contains readable settings for:

- ruleset version;
- realistic MSLP limits;
- main and intermediate observation hours;
- 00/12 UTC pressure checks;
- cloud-level boundaries;
- the 1-3-5 cloud-layer thresholds;
- maximum reportable-cloud groups;
- CB nature codes; and
- the extended monthly-rainfall threshold and schedule.

Example: changing the maximum realistic MSLP from `1085.0` to `1080.0` requires changing only:

```js
maximumMslp: 1080.0
```

## 2. `dist/ruleset.js`

This contains the meteorological logic. Each batch has a comment describing its purpose. Edit this file only when the actual logic changes—for example, when a new relationship between two coded groups must be checked.

The file exports only:

- `SynopRuleset.parseCode()`
- `SynopRuleset.validate()`
- `SynopRuleset.version`

## 3. `dist/app.js`

This controls the visible webpage:

- buttons;
- pressure-history fields;
- rainfall checkbox;
- display of decoded information; and
- error/warning cards.

Changing an operational meteorological rule should normally not require editing this file.

### Manual rainfall checkbox

The checkbox answers one specific question: **did rainfall occur during the
six hours immediately before this observation?** It is not derived from a
`6RRRtR` group because that group may cover a longer period. For example,
`60074` at 00 UTC means 7 mm over 24 hours; it does not show in which six-hour
part of that day the rain occurred.

The rainfall code is decoded as follows:

- `RRR=001` to `989`: 1 to 989 mm;
- `RRR=990`: trace;
- `RRR=991` to `999`: 0.1 to 0.9 mm.

The webpage clears the checkbox when a different `YYGGi`/station observation
is entered. It preserves the answer while groups within that same observation
are edited, which allows an erroneous report to be corrected without losing
the observer's six-hour rainfall answer.

## Safe editing workflow

1. Make one rule change at a time.
2. Update the version in `ruleset-config.js`.
3. Run `node tests/ruleset-regression.test.mjs`.
4. Test known correct and known incorrect observations.
5. Record the reason and example in `CHANGELOG.md`.
6. Upload the changed file to GitHub and commit it.

Keep the previous working version available so a change can be reversed if testing finds a problem.

## PAGASA cloud-layer interpretation added in v0.14

Do not add individual Section 3 cloud-layer amounts to derive `Nh`. Each `Ns`
is estimated as if the other layers did not exist, so layers may overlap. Check
that an individual low-cloud `Ns` does not exceed `Nh`, but allow, for example,
`Nh=5` with 3 oktas Cumulus and 4 oktas Stratocumulus.

For sky state:

- `N=0`: omit the main cloud group and Section 3 cloud groups;
- `N=9`: omit the main cloud group and report `89/hshs`, where `hshs` is
  vertical visibility; and
- `N=/`: omit the main cloud group and Section 3 cloud groups.
