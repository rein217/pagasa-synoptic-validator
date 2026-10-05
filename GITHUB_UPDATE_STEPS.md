# Update the v0.15.0 branch on GitHub

These files are intended for the existing `v0.15.0` review branch. Do not
upload them directly to `main` yet.

1. Open `https://github.com/rein217/pagasa-synoptic-validator`.
2. Use the branch selector above the file list and select `v0.15.0`.
3. Confirm that the page shows `v0.15.0`, not `main`.
4. Select **Add file**, then **Upload files**.
5. Extract the provided ZIP on your computer.
6. Drag all extracted files and folders into the GitHub upload area. Keep
   `index.html` at the repository root.
7. Use the commit message: `Review and correct v0.15.0 ruleset`.
8. Select **Commit directly to the v0.15.0 branch**.
9. Wait for the upload to finish, then verify that `index.html` shows
   `Ruleset v0.15.0` and that `dist/pdf` contains the v0.15.0 PDF.
10. Test the branch before opening a pull request to `main`.

## After operational approval

1. Open the repository's **Pull requests** tab.
2. Select **New pull request**.
3. Set **base** to `main` and **compare** to `v0.15.0`.
4. Review the changed files with your collaborator.
5. Create and merge the pull request only after both reviewers approve it.
6. GitHub Pages will then deploy the updated `main` branch. Use `Ctrl+F5` after
   deployment if the browser still shows cached v0.14 files.
