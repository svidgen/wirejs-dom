/**
 * Logs the wirejs-dom version to the console once per browser session.
 * Uses sessionStorage to track if the version has already been logged.
 */

// This will be replaced during build with the actual version from package.json
const VERSION = '1.0.42';
const STORAGE_KEY = `wirejs-dom-version-logged-${VERSION}`;

let hasLogged = false;

/**
 * Logs the wirejs-dom version to the console if it hasn't been logged
 * in this browser session yet.
 */
export function logVersionOnce(): void {
	// Skip if already logged in this execution context
	if (hasLogged) {
		return;
	}

	// Check if we're in a browser environment
	if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
		return;
	}

	// Check if version was already logged in this session
	try {
		if (sessionStorage.getItem(STORAGE_KEY)) {
			hasLogged = true;
			return;
		}

		// Log the version
		console.log(`wirejs-dom v${VERSION}`);

		// Mark as logged in sessionStorage
		sessionStorage.setItem(STORAGE_KEY, 'true');
		hasLogged = true;
	} catch (e) {
		// Silently fail if sessionStorage is not available (e.g., in private browsing mode)
		// or if there's any other error
	}
}
