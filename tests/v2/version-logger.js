// @ts-check
import { html } from '../../lib/v2/index.js';
import QUnit from 'qunit';

QUnit.module("v2", () => {
	QUnit.module('version logging', () => {
		QUnit.test("logs version on first html tag use", assert => {
			// Skip test if sessionStorage is not available (e.g., in jsdom)
			if (typeof sessionStorage === 'undefined') {
				assert.ok(true, 'Skipping test - sessionStorage not available in this environment');
				return;
			}

			// Clear sessionStorage before test
			sessionStorage.clear();

			// Mock console.log to capture output
			const originalConsoleLog = console.log;
			const logCalls = [];
			console.log = (...args) => {
				logCalls.push(args);
				originalConsoleLog(...args);
			};

			try {
				// Create first html element
				const element1 = html`<div>Test 1</div>`;
				
				// Check that version was logged
				const versionLogs = logCalls.filter(args => 
					args[0] && typeof args[0] === 'string' && args[0].startsWith('wirejs-dom v')
				);
				
				assert.equal(
					versionLogs.length,
					1,
					'Version should be logged exactly once'
				);
				
				assert.ok(
					versionLogs[0] && versionLogs[0][0].match(/^wirejs-dom v\d+\.\d+\.\d+$/),
					'Version log should match format "wirejs-dom vX.Y.Z"'
				);

				// Extract the actual version that was logged for use in subsequent test
				const loggedVersion = versionLogs[0][0];

				// Clear log calls for next check
				logCalls.length = 0;

				// Create second html element
				const element2 = html`<div>Test 2</div>`;
				
				// Check that version was NOT logged again
				const versionLogsAfter = logCalls.filter(args => 
					args[0] && typeof args[0] === 'string' && args[0].startsWith('wirejs-dom v')
				);
				
				assert.equal(
					versionLogsAfter.length,
					0,
					'Version should not be logged on subsequent html tag uses'
				);
			} finally {
				// Restore console.log
				console.log = originalConsoleLog;
			}
		});

		QUnit.test("does not log when sessionStorage already has the key", assert => {
			// Skip test if sessionStorage is not available (e.g., in jsdom)
			if (typeof sessionStorage === 'undefined') {
				assert.ok(true, 'Skipping test - sessionStorage not available in this environment');
				return;
			}

			// First, clear sessionStorage and create an element to get the actual version
			sessionStorage.clear();
			
			// Mock console.log to capture the version that gets logged
			const originalConsoleLog = console.log;
			let loggedVersion = null;
			console.log = (...args) => {
				if (args[0] && typeof args[0] === 'string' && args[0].startsWith('wirejs-dom v')) {
					loggedVersion = args[0];
				}
				originalConsoleLog(...args);
			};

			// Create first element to populate sessionStorage
			html`<div>Initial</div>`;
			
			// Find the storage key that was set
			let storageKey = null;
			for (let i = 0; i < sessionStorage.length; i++) {
				const key = sessionStorage.key(i);
				if (key && key.startsWith('wirejs-dom-version-logged-')) {
					storageKey = key;
					break;
				}
			}

			assert.ok(storageKey, 'Storage key should have been set');

			// Now clear logs and test that it doesn't log again
			const logCalls = [];
			console.log = (...args) => {
				logCalls.push(args);
				originalConsoleLog(...args);
			};

			try {
				// Create html element
				const element = html`<div>Test</div>`;
				
				// Check that version was NOT logged
				const versionLogs = logCalls.filter(args => 
					args[0] && typeof args[0] === 'string' && args[0].startsWith('wirejs-dom v')
				);
				
				assert.equal(
					versionLogs.length,
					0,
					'Version should not be logged when already marked in sessionStorage'
				);
			} finally {
				// Restore console.log
				console.log = originalConsoleLog;
				
				// Clean up
				sessionStorage.clear();
			}
		});
	});
});
