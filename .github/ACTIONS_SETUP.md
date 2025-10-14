# GitHub Actions Setup

This repository uses GitHub Actions for automated testing and publishing.

## Workflows

### 1. PR Tests (`pr-tests.yml`)
- **Trigger**: Runs automatically on pull requests to `main` and on pushes to `main`
- **Purpose**: Ensures all tests pass before code is merged
- **Steps**:
  - Checks out the code
  - Sets up Node.js (version 20)
  - Installs dependencies
  - Builds the project
  - Runs tests

### 2. Publish to NPM (`publish.yml`)
- **Trigger**: Runs automatically when code is merged to `main`
- **Purpose**: Publishes the package to NPM with provenance attestation (trusted publishing)
- **Steps**:
  - Checks out the code
  - Sets up Node.js (version 20)
  - Installs dependencies
  - Builds the project
  - Runs tests
  - Checks if the current version already exists on NPM (prevents duplicate publishes)
  - Publishes to NPM with provenance (only if version is new)

## Required Setup

### Branch Protection Rules
To require tests to pass before merging PRs, configure branch protection:

1. Go to: `Settings` → `Branches` → `Branch protection rules`
2. Add rule for `main` branch
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Select the `test` job from the PR Tests workflow
   - ✅ Do not allow bypassing the above settings

### NPM Publishing Setup
The publish workflow uses NPM's trusted publishing with provenance:

1. **Create NPM Token**:
   - Go to [npmjs.com](https://www.npmjs.com/)
   - Navigate to Access Tokens
   - Create a new "Automation" or "Granular Access" token with publish permissions
   
2. **Add to GitHub Secrets**:
   - Go to: `Settings` → `Secrets and variables` → `Actions`
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your NPM token

3. **Provenance**:
   - The workflow uses `--provenance` flag for trusted publishing
   - This creates cryptographically signed attestations linking the package to the source code
   - Requires `id-token: write` permission (already configured)

## Version Management

The publish workflow includes a version check that prevents duplicate publishes:
- Before publishing, it checks if the version in `package.json` already exists on NPM
- If the version exists, the publish step is skipped
- If the version is new, it proceeds with publishing

**Important**: Remember to bump the version in `package.json` before merging to main if you want the changes to be published. You can use:
```bash
npm version patch  # for bug fixes
npm version minor  # for new features
npm version major  # for breaking changes
```

## Testing the Workflows

The workflows will run automatically when:
- A pull request is opened or updated → `pr-tests.yml` runs
- Code is pushed to main (e.g., after merge) → Both workflows run

You can also manually trigger workflows from the Actions tab in GitHub.
