#!/usr/bin/env node

/**
 * Updates src/lib/v2/version.ts with the version from package.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packagePath = join(__dirname, '../package.json');
const versionPath = join(__dirname, '../src/lib/v2/version.ts');

try {
	// Read package.json
	const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
	const version = packageJson.version;

	// Generate version.ts content
	const content = `// This file is auto-generated. Do not edit manually.
// Run \`npm run update-version\` to update this file from package.json
export const VERSION = '${version}';
`;

	// Write version.ts
	writeFileSync(versionPath, content, 'utf-8');
	console.log(`✓ Updated version.ts to ${version}`);
} catch (error) {
	console.error('Error updating version:', error);
	process.exit(1);
}
