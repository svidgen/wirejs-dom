import { html, id, attribute } from '../../lib/v2/index.js';
import QUnit from 'qunit';

QUnit.module("v2", () => {
	QUnit.module('attribute()', () => {
		QUnit.test("can extract a node attribute", assert => {
			const { data } = html`<div>
				before
				<div
					${id('middle')}
					title=${attribute('middleTitle', 'default value')}
				>middle</div>
					after
			</div>`;

			assert.equal(
				data.middle.getAttribute('title'),
				'default value',
				"attribute is created with default value"
			)
			assert.equal(
				data.middleTitle,
				'default value',
				"extracted data property reads the attribute"
			);
		});

		QUnit.test("can be written to", assert => {
			const { data } = html`<div>
				before
				<div
					${id('middle')}
					title=${attribute('middleTitle', 'default value')}
				>middle</div>
					after
			</div>`;

			data.middleTitle = 'new title';

			assert.equal(
				data.middle.getAttribute('title'),
				'new title',
				"attribute updates are reflected in the DOM"
			)
			assert.equal(
				data.middleTitle,
				'new title',
				"attribute updates are reflected in the getter"
			);
		});

		QUnit.test("can be written to with a promise", async assert => {
			const { data } = html`<div>
				before
				<div
					${id('middle')}
					title=${attribute('middleTitle', 'default value')}
				>middle</div>
					after
			</div>`;

			const p = Promise.resolve('new title');

			// will need a typecast in TS
			data.middleTitle = p;

			await p;

			assert.equal(
				data.middle.getAttribute('title'),
				'new title',
				"attribute updates are reflected in the DOM"
			)
			assert.equal(
				data.middleTitle,
				'new title',
				"attribute updates are reflected in the getter"
			);
		});

		QUnit.test("can map values in (v, f) order ", assert => {
			const { data } = html`<div>
				before
				<div ${id('middle')} title=${
					attribute('middleTitle', 'default', v => v.toUpperCase())
					}>middle</div>
						after
			</div>`;

			assert.equal(
				data.middle.getAttribute('title'),
				'DEFAULT',
				"attribute mapping is reflected in the DOM"
			);

			assert.equal(
				data.middleTitle,
				'default',
				"attribute data value is retained"
			);
		});

		QUnit.test("can update mapped values in (v, f) order ", assert => {
			const { data } = html`<div>
				before
				<div ${id('middle')} title=${
					attribute('middleTitle', 'default', v => v.toUpperCase())
					}>middle</div>
						after
			</div>`;

			data.middleTitle = 'updated'

			assert.equal(
				data.middle.getAttribute('title'),
				'UPDATED',
				"attribute mapping is reflected in the DOM"
			);

			assert.equal(
				data.middleTitle,
				'updated',
				"attribute data value is retained"
			);
		});

		QUnit.test("can map values in (f, v) order ", assert => {
			const { data } = html`<div>
				before
				<div ${id('middle')} title=${
					attribute('middleTitle', v => v.toUpperCase(), 'default')
					}>middle</div>
						after
			</div>`;

			assert.equal(
				data.middle.getAttribute('title'),
				'DEFAULT',
				"attribute mapping is reflected in the DOM"
			);

			assert.equal(
				data.middleTitle,
				'default',
				"attribute data value is retained"
			);
		});

		QUnit.test("can update mapped values in (f, v) order ", assert => {
			const { data } = html`<div>
				before
				<div ${id('middle')} title=${
					attribute('middleTitle', v => v.toUpperCase(), 'default')
					}>middle</div>
						after
			</div>`;

			data.middleTitle = 'updated';

			assert.equal(
				data.middle.getAttribute('title'),
				'UPDATED',
				"attribute mapping is reflected in the DOM"
			);

			assert.equal(
				data.middleTitle,
				'updated',
				"attribute data value is retained"
			);
		});

		QUnit.test("can map values in f-only 'order'", assert => {
			const { data } = html`<div>
				before
				<div ${id('middle')} title=${
					attribute('middleTitle', () => 'just always this')
					}>middle</div>
						after
			</div>`;

			assert.equal(
				data.middle.getAttribute('title'),
				'just always this',
				"attribute mapping is reflected in the DOM"
			);

			assert.equal(
				data.middleTitle,
				undefined,
				"attribute data value is retained"
			);
		});

		QUnit.test("can update mapped values in f-only 'order'", assert => {
			const { data } = html`<div>
				before
				<div ${id('middle')} title=${
					attribute('middleTitle', v => v?.toUpperCase())
					}>middle</div>
						after
			</div>`;

			data.middleTitle = 'updated';

			assert.equal(
				data.middle.getAttribute('title'),
				'UPDATED',
				"attribute mapping is reflected in the DOM"
			);

			assert.equal(
				data.middleTitle,
				'updated',
				"attribute data value is retained"
			);
		});

		QUnit.test("responds to user input when no other element keys exist", assert => {
			/**
			 * WARNING: DO NOT ADD KEYS TO THIS ELEMENT!!!
			 * 
			 * This test protects against a bug that used to occur when an `attribute`
			 * was the only/first `data` property listed in the element. In these cases,
			 * the `data` property was not initialized prior to the `attribute` blessing,
			 * which caused the blessing to point the attribute at an incorrect object.
			 */
			const node = html`<div>
				before
				<input
					id='inputNode'
					type='text'
					name='something'
					value=${attribute('inputValue', '')} />
			</div>`;

			const inputNode = node.querySelector('#inputNode');
			inputNode.value = 'new value';
			inputNode.oninput();

			assert.equal(
				node.data.inputValue,
				'new value',
				"the node's data property is updated to match"
			)
		});
	});
});
