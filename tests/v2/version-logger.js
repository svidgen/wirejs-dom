// @ts-check
import { html } from '../../lib/v2/index.js';
import { resetLogState } from '../../lib/v2/version-logger.js';
import QUnit from 'qunit';

QUnit.module("v2", () => {
	QUnit.module('version logging', () => {
		QUnit.test("logs version on first html tag use", assert => {
			// Reset log state for testing
			resetLogState();

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
	});
});
