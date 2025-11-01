/**
 * Logs the wirejs-dom version to the console once per page load.
 * Uses a module-level variable to track if the version has already been logged.
 */

import { VERSION } from './version.js';

let hasLogged = false;

/**
 * Logs the wirejs-dom version to the console if it hasn't been logged yet.
 */
export function logVersionOnce(): void {
	// Skip if already logged in this execution context
	if (hasLogged) {
		return;
	}

	// Check if we're in a browser environment
	if (typeof window === 'undefined') {
		return;
	}

	// Log the version
	console.log(`wirejs-dom v${VERSION}`);

	// Mark as logged
	hasLogged = true;
}

/**
 * Reset the logged state. Only for testing purposes.
 * @internal
 */
export function resetLogState(): void {
	hasLogged = false;
}
