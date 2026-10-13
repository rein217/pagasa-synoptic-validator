# Upload this update to GitHub

## Review in a branch first

1. Download and extract the ZIP on your computer.
2. Open your repository, normally `rein217/pagasa-synoptic-validator`.
3. Use the branch selector to create a branch named `release-v0.16.5` from main. If that name already exists, use another clear review name.
4. On that branch choose **Add file > Upload files**.
5. Drag the extracted package CONTENTS into the upload area: index.html, ruleset.html, dist, docs, tests, README.md, CHANGELOG.md, RULESET_GUIDE.md and UPLOAD_TO_GITHUB.md. Include the optional .gitignore and .nojekyll files if visible.
6. Do not upload the ZIP itself or the outer package folder. Do not remove your collaborator's unrelated files or existing workflows. This package intentionally replaces the validator pages and supporting assets.
7. Use the commit message `Release validator v0.16.5 with observation alarm and retained rainfall updates` and commit to the review branch.
8. Open **Compare & pull request**, with base main and compare release-v0.16.5. Review the changed files with your collaborator, then merge when ready.

## Publish and confirm

For branch-based GitHub Pages, use **Settings > Pages > Build and deployment > Deploy from a branch**, with main and /(root), then Save. If the repository already uses a GitHub Actions workflow for Pages, preserve it and confirm it publishes the root index.html and dist assets.

After the deployment succeeds, open the Pages link shown in Settings. Refresh with Ctrl+F5. Check:

- Ruleset v0.16.5 is visible and opens the ruleset page.
- Its PDF opens and downloads.
- Intermediate reports show previous 3 hours, main reports previous 6 hours.
- The exact input appears only when checked.
- A 24-hour rain group alone does not check the box; 00 UTC Section 5 rain does.
- T and Trace work.
- Review rainfall opens the popup, with month-name UTC labels.
- Copy code and input highlights still work.

The package is complete; older unused root app.js files need not be loaded. The new index.html loads only dist/js/*.js. Do not mix current HTML with older JavaScript or config files.

## Alarm checks after deployment

- Alarm settings opens; default is OFF. Select your station and delay.
- Choose and preview urgent beeps, ringing alarm, chime or uploaded MP3/WAV.
- Save settings, reopen and confirm they persist.
- Keep the browser open and computer awake to test the deadline.
- Confirm Dismiss and Snooze, and that validating the matching station/time clears the reminder.

The new package includes v0.16.4 and v0.16.5. Do not upload the former separately. Keep the existing repository and Pages address to preserve browser-local records. PDF links in the package are relative and open the bundled PDF on GitHub Pages.
