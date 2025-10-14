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

### 2. Semantic PR Title Check (`semantic-pr.yml`)
- **Trigger**: Runs on PR opened, edited, or synchronized
- **Purpose**: Enforces semantic commit conventions in PR titles
- **Supported Types**:
  - `feat`: New features (triggers minor version bump)
  - `fix`: Bug fixes (triggers patch version bump)
  - `perf`: Performance improvements (triggers patch version bump)
  - `refactor`: Code refactoring (triggers patch version bump)
  - `build`: Build system changes (triggers patch version bump)
  - `chore`: Maintenance tasks (triggers patch version bump)
  - `docs`: Documentation only (no version bump)
  - `style`: Code style changes (no version bump)
  - `test`: Test changes (no version bump)
  - `ci`: CI/CD changes (no version bump)
  - `revert`: Revert changes (no version bump)
- **Breaking Changes**: Add `!` after the type (e.g., `feat!:` or `fix!:`) to trigger a major version bump
- **Example PR Titles**:
  - `feat: add new component` (minor bump)
  - `fix: resolve rendering bug` (patch bump)
  - `feat!: redesign API` (major bump)
  - `docs: update README` (no bump)

### 3. Version Bump (`version-bump.yml`)
- **Trigger**: Runs automatically when a PR is merged to `main`
- **Purpose**: Automatically bumps the package version based on the PR title
- **Steps**:
  - Determines version bump type from PR title
  - Installs dependencies
  - Runs `npm version` with appropriate bump type
  - Commits version change with `[skip ci]` flag
  - Pushes commit and tag back to repository
- **Skips**: Documentation, style, test, and CI-only changes

### 4. Publish to NPM (`publish.yml`)
- **Trigger**: Runs automatically when code is pushed to `main` (except commits with `[skip ci]`)
- **Purpose**: Publishes the package to NPM with provenance attestation using trusted publishing
- **Steps**:
  - Checks out the code
  - Sets up Node.js (version 22)
  - Installs dependencies
  - Builds the project
  - Runs tests
  - Checks if the current version already exists on NPM (prevents duplicate publishes)
  - Publishes to NPM with provenance (only if version is new)
- **Skips**: Commits containing `[skip ci]` in the message (e.g., version bump commits)

## Required Setup

### Branch Protection Rules
To require tests to pass and enforce semantic PR titles before merging:

1. Go to: `Settings` → `Branches` → `Branch protection rules`
2. Add rule for `main` branch
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Select the following required status checks:
     - `test` (from PR Tests workflow)
     - `check-title` (from Semantic PR Title Check workflow)
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

## Automatic Version Management

This repository uses **automated semantic versioning** based on PR titles:

### How It Works

1. **PR Title Format**: All PRs must follow semantic commit conventions (enforced by `semantic-pr.yml`)
2. **Automatic Version Bump**: When a PR is merged, the `version-bump.yml` workflow:
   - Analyzes the PR title to determine the version bump type
   - Automatically updates `package.json` version
   - Commits the change with `[skip ci]` to avoid triggering unnecessary builds
   - Pushes the version commit and tag to the repository
3. **Automatic Publishing**: After the version bump, the `publish.yml` workflow:
   - Checks if the new version exists on NPM
   - Publishes to NPM if the version is new
   - Skips commits with `[skip ci]` (like version bumps themselves)

### Version Bump Rules

| PR Title Prefix | Version Bump | Example |
|----------------|--------------|---------|
| `feat:` | Minor (0.x.0) | `feat: add new feature` → 1.0.0 → 1.1.0 |
| `fix:`, `perf:`, `refactor:`, `build:`, `chore:` | Patch (0.0.x) | `fix: resolve bug` → 1.0.0 → 1.0.1 |
| `feat!:`, `fix!:`, etc. (with `!`) | Major (x.0.0) | `feat!: breaking change` → 1.0.0 → 2.0.0 |
| `docs:`, `style:`, `test:`, `ci:`, `revert:` | No bump | `docs: update README` → 1.0.0 → 1.0.0 |

### Manual Version Bumping (Not Recommended)

The version is now managed automatically. However, if needed, you can still bump manually:
```bash
npm version patch  # for bug fixes
npm version minor  # for new features
npm version major  # for breaking changes
```

**Note**: Manual version bumps should include `[skip ci]` in the commit message to prevent workflow conflicts.

## Testing the Workflows

The workflows will run automatically when:
- A pull request is opened or updated → `pr-tests.yml` runs
- Code is pushed to main (e.g., after merge) → Both workflows run

You can also manually trigger workflows from the Actions tab in GitHub.
