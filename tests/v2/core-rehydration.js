import { html, text, node } from '../../lib/v2/index.js';
import QUnit from 'qunit';

// NOTE: The callbacks provided by the browser (and therefore this library) are not
// immediate. Hence, the async testing patterns.

async function sleep(ms = 1) {
	return new Promise(unsleep => setTimeout(unsleep, ms));
}

// /**
//  * 
//  * @param {Element} rendered 
//  */
// function getDataFrom(rendered) {
// 	const DATA_PREFIX = 'wirejs-data'
// 	const data = {};
// 	for (const name of rendered.getAttributeNames()) {
// 		if (!name.startsWith(DATA_PREFIX)) continue;
// 		const propName = name.substring(DATA_PREFIX.length);
// 		if (propName) {
// 			data[propName] = JSON.parse(rendered.getAttribute(name))
// 		}
// 	}
// 	return data;
// }

/**
 * 
 * @param {Element} rendered 
 * @returns 
 */
function getDataFrom(rendered) {
	return JSON.parse(rendered.getAttribute('wirejs-data') || {});
}

/**
 * This would be used at "pickling" time; not at rehydration time.
 * 
 * I think what we should do is call something like this when `hydrate(...)`
 * is called from a node context. This should cause it to crawl the `document` looking
 * for matching nodes to attach `wirejs-data` properties to -- but only those necessary
 * to satisfy the hydration.
 * 
 * When `hydration` is called from the client then, it's invocation should theoretically
 * align with the server-side invocation, picking up nodes that have had `wirejs-data`
 * properties attached to them.
 * 
 * @param {Element} node 
 */
function populateDataAttributes(node, isRoot = true) {
	const data = {};

	for (const [k, v] of Object.entries(node.data)) {
		if (v instanceof Node) {
			data[k] = { data: populateDataAttributes(v, false) };
		} else {
			data[k] = v;
		}
	}

	if (isRoot) {
		try {
			node.setAttribute('wirejs-data', JSON.stringify(data));
		} catch {
			console.error("Data for node could not be serialized.", node);
		}
	} else {
		return data;
	}
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
				JSON.parse(greeting.getAttribute('wirejs-data')),
				{
					interjectionChild: {
						data: {
							interjection: 'Hello, '
						},
					},
					nameChild: {
						data: {
							name: 'name placeholder'
						}
					}
				},
				"hydrated wirejs-data attribute matches expected"
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
