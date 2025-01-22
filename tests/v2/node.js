import { html, node } from '../../lib/v2/index.js';
import QUnit from 'qunit';

QUnit.module("v2", () => {
	QUnit.module('node()', () => {

		QUnit.test("can create a named element", assert => {
			const t = html`<div>before ${node(
				'middle', () => html`<span>middle text</span>`
			)} after</div>`;

			assert.equal(
				t.innerHTML,
				"before <span>middle text</span> after",
				"tag innerHTML matches"
			);

			assert.equal(
				t.data.middle,
				undefined,
				"data property of the text node matches"
			);
		});

		QUnit.test("can be created empty", assert => {
			const t = html`<div>before ${node('middle')} after</div>`;

			assert.equal(
				t.innerHTML,
				"before  after",
				"tag innerHTML matches"
			);

			assert.equal(
				t.data.middle,
				undefined,
				"data property of the text node matches"
			);
		});

		QUnit.test("can have default values", assert => {
			const t = html`<div>before ${node(
				'middle', 'middle text', (v) => html`<span>${v}</span>`)
				} after</div>`;

			assert.equal(
				t.innerHTML,
				"before <span>middle text</span> after",
				"tag innerHTML matches"
			);

			assert.equal(
				t.data.middle,
				'middle text',
				"data property of the text node matches"
			);
		});

		QUnit.test("set be set", assert => {
			const t = html`<div>before ${node(
				'middle',
				'default value',
				/**
				 * @param {string} v 
				 */
				(v) => html`<span>${v}</span>`)
				} after</div>`;

			t.data.middle = 'something else';

			assert.equal(
				t.innerHTML,
				"before <span>something else</span> after",
				"tag innerHTML matches"
			);

			assert.equal(
				t.data.middle,
				'something else',
				"data property of the text node matches"
			);
		});

		QUnit.test("set be set repeatedly", assert => {
			const t = html`<div>before ${node(
				'middle',
				'default value',
				/**
				 * @param {string} v 
				 */
				(v) => html`<span>${v}</span>`)
				} after</div>`;

			t.data.middle = 'something else 1';
			t.data.middle = 'something else 2';
			t.data.middle = 'something else 3';

			assert.equal(
				t.innerHTML,
				"before <span>something else 3</span> after",
				"tag innerHTML matches"
			);

			assert.equal(
				t.data.middle,
				'something else 3',
				"data property of the text node matches"
			);
		});

		QUnit.test("can be conditional", assert => {
			const t = html`<div>before ${node(
				'middle',
				11,
				/**
				 * @param {number} n
				 */
				(n) => n % 2 === 0 ?
					html`<i>${n} is even</i>` :
					html`<b>${n} is odd</b>`
			)} after</div>`;

			assert.equal(
				t.innerHTML,
				"before <b>11 is odd</b> after",
				"tag innerHTML matches"
			);

			t.data.middle = 22;

			assert.equal(
				t.innerHTML,
				"before <i>22 is even</i> after",
				"tag innerHTML matches"
			);

			assert.equal(
				t.data.middle,
				22,
				"data property of the text node matches"
			);
		});

	});
});
