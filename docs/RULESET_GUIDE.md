# Beginner guide to the separated ruleset

The website is divided into three JavaScript files so that operational rules can be reviewed without touching the page controls.

Current reviewed release: **v0.15.0**.

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

## v0.15.0 operational behavior

### Bulletin type and observation time

- `SMPH20` is expected at 00, 06, 12, and 18 UTC.
- `SIPH20` is expected at 03, 09, 15, and 21 UTC.
- The bulletin day/hour is compared with `AAXX YYGGiw` when both are present.

### Local pressure history

- A structurally valid, plausible `4PPPP` MSLP is retained for 36 hours.
- Matching uses the station identifier and SYNOP day/hour.
- Three-hour history may fill `5appp`; 24-hour history may fill `58/59` at
  00 and 12 UTC.
- Manual pressure entries are not overwritten.
- Storage is limited to the current browser and device. It is not synchronized.
- Matching is skipped where the missing month/year makes a month crossing
  uncertain.

### Rainfall checkbox

- A measurable/trace `6RRRtR` or liquid-precipitation weather evidence may
  select the checkbox automatically.
- `6000t` and `6////` do not establish definite rainfall occurrence.
- Snow-only weather is not automatically treated as rainfall.
- A user's manual checkbox choice is preserved while the code is edited.
- The rules engine and webpage use the same rainfall-evidence function.

### Visibility

- Heavy precipitation permits horizontal visibility of 2 km or less.
- `ww=40` permits horizontal visibility of 2 km or less.
- `ww=04`, `05`, and `06` have no mandatory upper visibility limit. The haze
  intensity table is guidance and is not enforced as an error threshold.

### CB supplementary group

The accepted `949CD` nature figures are:

- `C=4`: isolated cumulonimbus;
- `C=5`: numerous cumulonimbus;
- `C=6`: isolated cumulus and cumulonimbus; and
- `C=7`: numerous cumulus and cumulonimbus.

More than one `949CD` group may be reported for different directions.

### Duplicate Section 1 groups

The validator compares group families, not only complete strings. For example,
`10313 10312` is reported as two competing `1snTTT` groups. The same check is
applied to the single-occurrence temperature, humidity/dew point, station
pressure, MSLP, pressure tendency, weather, and main-cloud families.

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
