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

			// Set sessionStorage to indicate version was already logged
			sessionStorage.setItem('wirejs-dom-version-logged-1.0.42', 'true');

			// Mock console.log to capture output
			const originalConsoleLog = console.log;
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
