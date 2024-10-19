import { html, id, attribute } from '../../lib/v2/index.js';
import QUnit from 'qunit';

QUnit.module("v2", () => {
	QUnit.module('id()', () => {
		QUnit.test("can extract a node", assert => {
			const { data } = html`<div>
				before
				<div ${id('middle')}>middle</div>
					after
			</div>`;

			assert.equal(
				data.middle.tagName,
				'DIV',
				"extracted node tag type is correct"
			);
			assert.equal(
				data.middle.innerHTML,
				'middle',
				"extracted node content matches"
			);
		});

		QUnit.test("extracted node is mutable", assert => {
			const { data } = html`<div>
				before
				<div ${id('middle')}>middle</div>
					after
			</div>`;
			data.middle.innerHTML = 'changed';
			assert.equal(data.middle.innerHTML, 'changed', 'data has changed as expected');
		});

		QUnit.test("extracted node is replaceable", assert => {
			const { data } = html`<div>
				before
				<div ${id('middle')}>middle</div>
					after
			</div>`;
			data.middle = html`<span>changed</span>`;
			assert.equal(data.middle.innerHTML, 'changed', 'data has changed as expected');
		});

		QUnit.test("extracted node is replaceable with a promise", async assert => {
			const { data } = html`<div>
				before
				<div ${id('middle')}>middle</div>
					after
			</div>`;

			const p = Promise.resolve(html`<span>changed with promise</span>`);

			// requires typecase in TS
			data.middle = p;
			await p;

			assert.equal(
				data.middle.innerHTML,
				'changed with promise',
				'data has changed as expected'
			);
		});

	});
});
