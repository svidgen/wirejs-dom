import { html, text } from '../../lib/v2/index.js';
import QUnit from 'qunit';

// NOTE: The callbacks provided by the browser (and therefore this library) are not
// immediate. Hence, the async testing patterns.

async function sleep(ms = 1) {
	return new Promise(unsleep => setTimeout(unsleep, ms));
}

/**
 * 
 * @param {Element} rendered 
 */
function getDataFrom(rendered) {
	const DATA_PREFIX = 'wirejs-data-'
	const data = {};
	for (const name of rendered.getAttributeNames()) {
		if (!name.startsWith(DATA_PREFIX)) continue;
		const propName = name.substring(DATA_PREFIX.length);
		if (propName) {
			data[propName] = JSON.parse(rendered.getAttribute(name))
		}
	}
	return data;
}

/**
 * Hydrates a server-rendered element by replacing it with a live version.
 * 
 * This function transfers the serialized `data` attributes from the 
 * statically rendered element (`rendered`) to the replacement live element 
 * (`replacement`). The replacement element's `data` property will be 
 * populated with the deserialized values from the server-rendered element.
 * 
 * The `rendered` element is then replaced in the DOM with the `replacement` element.
 * 
 * This function must be called explicitly for each element to hydrate, 
 * providing granular control over the hydration process.
 * 
 * Example Usage:
 * 
 * ```js
 * const serverElement = document.getElementById('todo-list');
 * const liveElement = createTodoList(); // Creates the live version
 * hydrate(serverElement, liveElement);
 * ```
 *
 * @param {Element} rendered - The statically rendered element with serialized `data` attributes.
 * @param {Element & { data: object }} replacement - The live element with a `data` property to populate.
 */
function hydrate(rendered, replacement) {
	const renderedData = getDataFrom(rendered);
	console.log({renderedData});

	for (const [k, v] of Object.entries(renderedData)) {
		replacement.data[k] = v;
	}

	if (rendered.parentNode) {
		rendered.parentNode.replaceChild(replacement, rendered);
	}
}

QUnit.module("v2", () => {
	QUnit.module('html`` rehydration engine', () => {

		QUnit.test("serialize default text property values into attributes", assert => {
			const t = html`<div>Hello, ${text('name', 'person')}!</div>`;

			assert.equal(
				t.outerHTML,
				'<div wirejs-data-name="&quot;person&quot;">Hello, person!</div>',
				'outerHTML matches'
			);
		});

		QUnit.test("serialize text properties into attributes", assert => {
			const t = html`<div>Hello, ${text('name', 'person')}!</div>`;
			t.data.name = 'World';

			assert.equal(
				t.outerHTML,
				'<div wirejs-data-name="&quot;World&quot;">Hello, World!</div>',
				'outerHTML matches'
			);
		});

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
			const baseHtml = base.outerHTML;

			const replacement = html`<div>Hello, ${text('name', 'person')}!</div>`;
			hydrate(base, replacement);

			assert.equal(
				replacement.outerHTML,
				'<div wirejs-data-name="&quot;World&quot;">Hello, World!</div>',
				'outerHTML matches'
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
