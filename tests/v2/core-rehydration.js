import {
	html,
	text,
	node,
	hydrate,
} from '../../lib/v2/index.js';
import {
	populateDataAttributes,
	getDataFrom
} from '../../lib/v2/ss_.js';
import QUnit from 'qunit';

// NOTE: The formatting of the HTML in this file is generally optimized for ease
// of constructing the corresponding assertion HTML. It is not intended to demonstrate
// "good" formatting.

QUnit.module("v2", () => {
	QUnit.module('html`` rehydration engine', () => {

		QUnit.test("serialize default text property values into attributes", assert => {
			const t = html`<div>Hello, ${text('name', 'person')}!</div>`;
			populateDataAttributes(t);

			assert.equal(
				t.outerHTML,
				'<div wirejs-data="{&quot;name&quot;:&quot;person&quot;}">Hello, person!</div>',
				'outerHTML matches'
			);
		});

		QUnit.test("serialize text properties into attributes", assert => {
			const t = html`<div>Hello, ${text('name', 'person')}!</div>`;
			t.data.name = 'World';
			populateDataAttributes(t);

			assert.equal(
				t.outerHTML,
				'<div wirejs-data="{&quot;name&quot;:&quot;World&quot;}">Hello, World!</div>',
				'outerHTML matches'
			);
		});

		// TODO: do we need to do this?
		// QUnit.test("serializes literal values into args attribute", assert => {
		// 	const person = 'World';
		// 	const t = html`<div>Hello, ${person}!</div>`;

		// 	assert.equal(
		// 		t.outerHTML,
		// 		'<div wirejs-args="[&quot;World&quot;]">Hello, World!</div>',
		// 		'outerHTML matches'
		// 	);
		// });

		QUnit.test("can hydrate a component with a matching data attribute", assert => {
			const base = html`<div>Hello, ${text('name', 'person')}!</div>`;
			base.data.name = 'World';
			populateDataAttributes(base);

			const replacement = html`<div>Hello, ${text('name', 'person')}!</div>`;
			hydrate(base, replacement);

			assert.equal(
				replacement.outerHTML,
				'<div>Hello, World!</div>',
				'outerHTML matches'
			);
		});

		QUnit.test("can extract data from nested named components", assert => {
			const name = html`<span>
				${text('name', 'name placeholder')}
			</span>`;

			const interjection = html`<span>${text(
				'interjection',
				'interjection placeholder'
			)}</span>`;
			interjection.data.interjection = 'Hello, ';

			const greeting = html`<div>
				${node('interjectionChild', interjection)}
				${node('nameChild', name)}
			</div>`;

			populateDataAttributes(greeting);

			assert.deepEqual(
				getDataFrom(greeting),
				{
					'interjectionChild': {
						data: { interjection: 'Hello, ' }
					},
					'nameChild': {
						data: { name: 'name placeholder' }
					}
				},
				"hydrated wirejs-data attribute matches expected"
			);
		});

		QUnit.test("can hydrate new components based on DOM node data props", assert => {
			function makeGreeting() {
				const name = html`<span>${
					text('name', 'name placeholder')
				}</span>`;

				const interjection = html`<span>${text(
					'interjection',
					'interjection placeholder'
				)}</span>`;

				return html`<div>${node(
					'interjectionChild', interjection)
				}${node(
					'nameChild', name)
				}</div>`;
			}

			const original = makeGreeting();
			original.data.interjectionChild.data.interjection = 'Hello, ';

			populateDataAttributes(original);

			const copied = makeGreeting();
			copied.data = getDataFrom(original);

			assert.equal(
				copied.innerHTML,
				`<span>Hello, </span><span>name placeholder</span>`
			);

			assert.equal(
				copied.data.interjectionChild.data.interjection,
				'Hello, '
			);

			assert.equal(
				copied.data.nameChild.data.name,
				'name placeholder'
			);
		});

		// what do we do with regular, interpolated values?
		// they can probably be serialized into an attribute like `wirejs-args`.
		// but, what do we do on rehydration? how do we give the customer control
		// over whether the serialized value is used or a new one?

		// TODO: test to ensure that onadd() is called during rehydration

		// TODO: test that rehydration does *not* occur when use-agent is a bot
	});
});
