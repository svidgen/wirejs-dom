import {
	html,
	id,
	node,
	text,
	hydrate,
	dehydrate
} from '../../lib/v2/index.js';
import {
	getDataFrom
} from '../../lib/v2/ss_.js';
import QUnit from 'qunit';

// NOTE: The formatting of the HTML in this file is generally optimized for ease
// of constructing the corresponding assertion HTML. It is not intended to demonstrate
// "good" formatting.

QUnit.module("v2", () => {
	QUnit.module('html`` rehydration engine', () => {

		QUnit.test("can dehydrate default text property values into attributes", assert => {
			const t = html`<div>Hello, ${text('name', 'person')}!</div>`;
			dehydrate(t);

			assert.equal(
				t.outerHTML,
				'<div wirejs-data="{&quot;name&quot;:&quot;person&quot;}">Hello, person!</div>',
				'outerHTML matches'
			);
		});

		QUnit.test("can dehydrate text properties into attributes", assert => {
			const t = html`<div>Hello, ${text('name', 'person')}!</div>`;
			t.data.name = 'World';
			dehydrate(t);

			assert.equal(
				t.outerHTML,
				'<div wirejs-data="{&quot;name&quot;:&quot;World&quot;}">Hello, World!</div>',
				'outerHTML matches'
			);
		});

		QUnit.test("can dehydrate empty node()", assert => {
			const t = html`<div>Hello, ${node('name')}!</div>`;
			dehydrate(t);
	
			assert.equal(
				t.outerHTML,
				'<div wirejs-data="{}">Hello, !</div>',
				'outerHTML matches'
			);
		});

		QUnit.test("can dehydrate nested node()", assert => {
			const grandchild = html`<div>grandchild</div>`;
			const child = html`<div>${node('grandchild', grandchild)}</div>`;
			const t = html`<div>Hello, ${node('child', child)}!</div>`;
			dehydrate(t);
	
			assert.equal(
				t.outerHTML,
				'<div wirejs-data=\"{&quot;child&quot;:{&quot;data&quot;:{&quot;grandchild&quot;:{&quot;data&quot;:{}}}}}\">Hello, <div><div>grandchild</div></div>!</div>',
				'outerHTML matches'
			);
		});

		QUnit.test("uses empty data object for id() hydration", assert => {
			const t = html`<div>Hello, <span ${id('name')}>person</span>!</div>`;
			dehydrate(t);
	
			assert.equal(
				t.outerHTML,
				'<div wirejs-data=\"{&quot;name&quot;:{&quot;data&quot;:{}}}\">Hello, <span data-id=\"name\">person</span>!</div>',
				'outerHTML matches'
			);
		});

		QUnit.test("essentially ignores id() during rehydration", async assert => {
			const base = html`<div>Hello, <span ${id('name')}>person</span>!</div>`;
			dehydrate(base);

			const replacement = html`<div>Hello, <span ${id('name')}>person</span>!</div>`;
			await hydrate(base, replacement);
	
			assert.equal(
				replacement.outerHTML,
				'<div>Hello, <span data-id=\"name\">person</span>!</div>',
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

		QUnit.test("can hydrate a component with a matching data attribute", async assert => {
			const base = html`<div>Hello, ${text('name', 'person')}!</div>`;
			base.data.name = 'World';
			dehydrate(base);

			const replacement = html`<div>Hello, ${text('name', 'person')}!</div>`;
			await hydrate(base, replacement);

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

			dehydrate(greeting);

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

			dehydrate(original);

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

		QUnit.test("can hydrate new components by `id` based on DOM node data props", async assert => {
			const DOM_ID = 'greeting-app-id';

			function makeGreeting() {
				const name = html`<span>${
					text('name', 'name placeholder')
				}</span>`;

				const interjection = html`<span>${text(
					'interjection',
					'interjection placeholder'
				)}</span>`;

				return html`<div id='${DOM_ID}'>${node(
					'interjectionChild', interjection)
				}${node(
					'nameChild', name)
				}</div>`;
			}

			const original = makeGreeting();
			original.data.interjectionChild.data.interjection = 'Hello, ';
			document.body.appendChild(original);

			dehydrate(original);

			const copied = makeGreeting();
			await hydrate(DOM_ID, copied);

			const hydrated = document.getElementById(DOM_ID);

			assert.equal(
				hydrated.innerHTML,
				`<span>Hello, </span><span>name placeholder</span>`
			);

			assert.equal(
				hydrated.data.interjectionChild.data.interjection,
				'Hello, '
			);

			assert.equal(
				hydrated.data.nameChild.data.name,
				'name placeholder'
			);

			assert.equal(
				copied,
				hydrated,
			);
			
			assert.notEqual(
				hydrated,
				original
			)

			hydrated.parentNode.removeChild(hydrated);
		});

		QUnit.test("`hydrate()` registers nodes when they're not yet in the DOM", async assert => {
			globalThis.pendingDehydrations = [];
			
			await hydrate('non-existent-id', () => {});

			assert.ok(
				typeof globalThis.pendingDehydrations.pop() === 'function'
			);
		});

		QUnit.test("can hydrate using a function", async assert => {
			const DOM_ID = 'greeting-app-id';

			function makeGreeting() {
				const name = html`<span>${
					text('name', 'name placeholder')
				}</span>`;

				const interjection = html`<span>${text(
					'interjection',
					'interjection placeholder'
				)}</span>`;

				return html`<div id='${DOM_ID}'>${node(
					'interjectionChild', interjection)
				}${node(
					'nameChild', name)
				}</div>`;
			};

			const original = makeGreeting();
			original.data.interjectionChild.data.interjection = 'Hello, ';
			document.body.appendChild(original);

			dehydrate(original);

			await hydrate(DOM_ID, makeGreeting);

			const hydrated = document.getElementById(DOM_ID);

			assert.equal(
				hydrated.innerHTML,
				`<span>Hello, </span><span>name placeholder</span>`
			);

			assert.equal(
				hydrated.data.interjectionChild.data.interjection,
				'Hello, '
			);

			assert.equal(
				hydrated.data.nameChild.data.name,
				'name placeholder'
			);

			assert.notEqual(
				hydrated,
				original
			);

			hydrated.parentNode.removeChild(hydrated);
		});

		QUnit.test("hydration function receives data from existing node", async assert => {
			const DOM_ID = 'greeting-app-id';

			function makeGreeting() {
				const name = html`<span>${
					text('name', 'name placeholder')
				}</span>`;

				const interjection = html`<span>${text(
					'interjection',
					'interjection placeholder'
				)}</span>`;

				return html`<div id='${DOM_ID}'>${node(
					'interjectionChild', interjection)
				}${node(
					'nameChild', name)
				}</div>`;
			};

			const original = makeGreeting();
			original.data.interjectionChild.data.interjection = 'Hello, ';
			document.body.appendChild(original);

			dehydrate(original);

			let params_seen;

			await hydrate(DOM_ID, params => {
				params_seen = params;
				return makeGreeting();
			});

			const hydrated = document.getElementById(DOM_ID);

			assert.deepEqual(
				params_seen,
				{
					data: {
						interjectionChild: {
							data: {
								interjection: "Hello, "
							}
						},
						nameChild: {
							data: {
								name: "name placeholder"
							}
						}
					}
				}
			)

			assert.equal(
				hydrated.innerHTML,
				`<span>Hello, </span><span>name placeholder</span>`
			);

			assert.equal(
				hydrated.data.interjectionChild.data.interjection,
				'Hello, '
			);

			assert.equal(
				hydrated.data.nameChild.data.name,
				'name placeholder'
			);

			assert.notEqual(
				hydrated,
				original
			);

			hydrated.parentNode.removeChild(hydrated);
		});

		// what do we do with regular, interpolated values?
		// they can probably be serialized into an attribute like `wirejs-args`.
		// but, what do we do on rehydration? how do we give the customer control
		// over whether the serialized value is used or a new one?

		// TODO: test to ensure that onadd() is called during rehydration

		// TODO: test that rehydration does *not* occur when use-agent is a bot
	});
});
