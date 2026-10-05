# PAGASA SYNOP Validator v0.15.0

Static WMO FM 12 SYNOP validator using PAGASA operational practices and the
2023 amended guidelines on surface synoptic observation.

Version 0.15.0 retains the **Report checker issue** button. It opens an editable
email draft addressed to `renieragas@gmail.com` containing the entered SYNOP
code and the validator findings. The webpage does not automatically send or
store the report. This version uses a shorter email link and copies the draft
as a fallback when the device has no default email application.

This release also adds main/intermediate bulletin checks, 36-hour browser-local
MSLP history, conservative rainfall autofill, semantic duplicate-group checks,
and the reviewed visibility and CB rules described in `docs/CHANGELOG.md`.

## Required website files

Keep the entry pages at the repository root and group the static assets under the distribution folders:

- `index.html`
- `ruleset.html`
- `dist/css/styles.css`
- `dist/js/app.js`
- `dist/js/ruleset-config.js`
- `dist/js/ruleset.js`
- `dist/pdf/PAGASA_SYNOP_Validator_Ruleset_v0.15.0.pdf`

The documentation and `tests` folder are recommended but are not required for
the webpage to load.

## File responsibilities

- `dist/js/ruleset-config.js` contains the beginner-editable operational settings.
- `dist/js/ruleset.js` contains parsing and meteorological validation logic.
- `dist/js/app.js` contains webpage controls and result rendering.
- `index.html` loads the files in the required order.
- `dist/css/styles.css` contains the first site's visual design.
- `ruleset.html` displays the current ruleset and provides the PDF download.

## Test before publishing

With Node.js installed, run:

```bash
node tests/ruleset-regression.test.mjs
```

Expected result:

```text
cloud, pressure, and additional-error regression checks passed
```

## Update an existing GitHub repository

1. Open the repository on GitHub.
2. Select **Add file → Upload files**.
3. Upload all files and folders from this package. Keep `index.html` in the
   repository root, not inside another folder.
4. When GitHub asks about files with the same name, allow the new files to
   replace the older versions.
5. Enter a commit message such as `Review and update v0.15.0`.
6. While reviewing, commit to the existing `v0.15.0` branch. Do not merge it
   into `main` until its branch preview and regression tests are approved.
7. Open a pull request from `v0.15.0` to `main`, review the listed changes, and
   merge only after operational acceptance.

## GitHub Pages settings

Under **Settings → Pages**, use:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/(root)**

After saving, GitHub normally needs a few minutes to publish the update.

This remains an operational review build and should continue to be checked
against official WMO and PAGASA documentation.
