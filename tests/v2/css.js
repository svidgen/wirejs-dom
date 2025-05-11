// @ts-check
import { css } from '../../lib/v2/index.js';
import QUnit from 'qunit';

// NOTE: The callbacks provided by the browser (and therefore this library) are not
// immediate. Hence, the async testing patterns.

QUnit.module("v2", () => {
	QUnit.module('css``', () => {
		QUnit.test("can create stylesheet nodes", assert => {
			const sheet = css`body {
				color: red;
				background-color: blue;
			}`;

			const expected = `body {
				color: red;
				background-color: blue;
			}`

			assert.equal(
				sheet.textContent,
				expected,
				'sheet contents match expected'
			);

			assert.equal(
				sheet.nodeName,
				'STYLE',
				'sheet is a style node'
			);
		});
	});
});
