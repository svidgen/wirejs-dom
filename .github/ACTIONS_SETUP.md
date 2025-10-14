# GitHub Actions Setup

This repository uses GitHub Actions for automated testing and publishing.

## Workflows

### 1. PR Tests (`pr-tests.yml`)
- **Trigger**: Runs automatically on pull requests to `main` and on pushes to `main`
- **Purpose**: Ensures all tests pass before code is merged
- **Steps**:
  - Checks out the code
  - Sets up Node.js (version 22)
  - Installs dependencies
  - Builds the project
  - Runs tests

### 2. Publish to NPM (`publish.yml`)
- **Trigger**: Runs automatically when code is merged to `main`
- **Purpose**: Publishes the package to NPM with provenance attestation using trusted publishing
- **Steps**:
  - Checks out the code
  - Sets up Node.js (version 22)
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
The publish workflow uses NPM's **Trusted Publishers** feature with provenance attestation. This allows publishing without storing an NPM token in GitHub secrets.

#### Setting up NPM Trusted Publishing:

1. **Configure Trusted Publisher on NPM** (required):
   - Go to [npmjs.com](https://www.npmjs.com/) and sign in
   - Navigate to your package (or create it first if new)
   - Go to package Settings → Publishing Access
   - Under "Trusted Publishers", click "Add trusted publisher"
   - Select "GitHub Actions" as the publisher type
   - Enter:
     - **Repository owner**: `svidgen`
     - **Repository name**: `wirejs-dom`
     - **Workflow name**: `publish.yml`
     - **Environment name**: (leave empty)
   - Save the configuration

2. **How it works**:
   - The workflow uses GitHub's OIDC token (via `id-token: write` permission) to authenticate with NPM
   - No NPM token needs to be stored in GitHub secrets
   - The `--provenance` flag creates cryptographically signed attestations linking the package to the source code
   - NPM verifies the GitHub Actions workflow is authorized to publish based on the trusted publisher configuration

3. **First-time package publishing**:
   - If this is a new package (never published before), you'll need to publish it manually the first time before setting up trusted publishing
   - Use `npm publish` locally with your NPM credentials for the first publish
   - After the first publish, configure the trusted publisher on NPM as described above

#### Alternative: Using NPM Token (fallback method)
If you prefer not to use trusted publishing, you can add an NPM_TOKEN to the workflow:

1. Create an NPM automation token at [npmjs.com](https://www.npmjs.com/)
2. Add it to GitHub Secrets: `Settings` → `Secrets and variables` → `Actions` → `NPM_TOKEN`
3. Uncomment the `NODE_AUTH_TOKEN` environment variable in the publish step of `publish.yml`

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
