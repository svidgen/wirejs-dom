import { html, text } from '../../lib/v2/index.js';
import QUnit from 'qunit';

// NOTE: The callbacks provided by the browser (and therefore this library) are not
// immediate. Hence, the async testing patterns.

async function sleep(ms = 1) {
	return new Promise(unsleep => setTimeout(unsleep, ms));
}

QUnit.module("v2", () => {
	QUnit.module('html``', () => {
		QUnit.test("returns the first element of the HTML", assert => {
			const t = html`<div>this is the <b>inner html!</b></div>`;
			assert.equal(
				t.innerHTML,
				'this is the <b>inner html!</b>',
				'innerHTML matches'
			);
		});

		QUnit.test("can use custom tag names", assert => {
			const t = html`<elementname>this is the <b>inner html!</b></elementname>`;
			assert.equal(
				t.tagName,
				'ELEMENTNAME',
				'tag name matches'
			);
			assert.equal(
				t.innerHTML,
				'this is the <b>inner html!</b>',
				'innerHTML matches'
			);
		});

		QUnit.test("can use namespaced tag names", assert => {
			const t = html`<my:elementname>this is the <b>inner html!</b></my:elementname>`;
			assert.equal(
				t.tagName,
				'MY:ELEMENTNAME',
				'tag name matches'
			);
			assert.equal(
				t.innerHTML,
				'this is the <b>inner html!</b>',
				'innerHTML matches'
			);
		});

		QUnit.test("can contain interpolate other HTMLElements directly", assert => {
			const child = html`<span>middle</span>`;
			const parent = html`<div>before ${child} after</div>`;
			assert.equal(
				parent.innerHTML,
				"before <span>middle</span> after",
				"the parent markup contains the child"
			);
		});

		QUnit.test("trims leading and trailing whitespace around container", assert => {
			const child = html`
				<span>middle</span>
			`;
			const parent = html`<div>before ${child} after</div>`;
			assert.equal(
				parent.innerHTML,
				"before <span>middle</span> after",
				"the parent markup contains the child"
			);
		});

		QUnit.test("can contain a list of child strings directly", assert => {
			const children = ['a', 'b', 'c'];
			const parent = html`<div>before ${children} after</div>`;
			assert.equal(
				parent.innerHTML,
				"before abc after",
				"the parent markup contains the children"
			);
		});

		QUnit.test("can contain a list of child html`` directly", assert => {
			const children = ['a', 'b', 'c'].map(c => html`<span>${c}</span>`);
			const parent = html`<div>before ${children} after</div>`;
			assert.equal(
				parent.innerHTML,
				"before <span>a</span><span>b</span><span>c</span> after",
				"the parent markup contains the children"
			);
		});

		QUnit.test("has onadd() which fires on document insertion", async assert => {
			const node = html`<div>
				hey there world.
			</div>`;

			const event = new Promise((resolve, reject) => {
				node.onadd(() => resolve('onadd'));
				sleep(100).then(() => reject('Timed out'));
			});

			document.body.appendChild(node);

			assert.equal(await event, 'onadd', 'onadd() callback fired');
		});

		QUnit.test("onadd() supplies self", async assert => {
			const node = html`<div>
				hey there world.
				${text('k', 'v')}
			</div>`;

			const event = new Promise((resolve, reject) => {
				node.onadd(self => resolve(self.data.k));
				sleep(100).then(() => reject('Timed out'));
			});

			document.body.appendChild(node);

			assert.equal(await event, 'v', 'onadd() callback fired with expected value');
		});

		QUnit.test("has onremove() which fires on document removal", async assert => {
			const node = html`<div>
				hey there world.
			</div>`;

			const event = new Promise((resolve, reject) => {
				node.onremove(() => resolve('onremove'));
				sleep(100).then(() => reject('Timed out'));
			});

			document.body.appendChild(node);

			// a short sleep is required to ensure the underlying MutationObserver sees
			// the node enter the DOM. otherwise, it reports the addition and removal in
			// a single event, and wirejs treats it like a no-op.
			await sleep();

			document.body.removeChild(node);

			assert.equal(await event, 'onremove', 'onadd() callback fired');
		});

		QUnit.test("onremove() supplies self", async assert => {
			const node = html`<div>
				hey there world.
				${text('k', 'v')}
			</div>`;

			const event = new Promise((resolve, reject) => {
				node.onremove(self => resolve(self.data.k));
				sleep(100).then(() => reject('Timed out'));
			});

			document.body.appendChild(node);

			// a short sleep is required to ensure the underlying MutationObserver sees
			// the node enter the DOM. otherwise, it reports the addition and removal in
			// a single event, and wirejs treats it like a no-op.
			await sleep();

			document.body.removeChild(node);

			assert.equal(await event, 'v', 'onadd() callback fired with expected value');
		});

		QUnit.test("can be extended with additional methods", async assert => {
			const node = html`<div>Hello ${text('name', '___')}.</div>`.extend(self => ({
				/**
				 * This docstring should show up on the method also.
				 * 
				 * @param {string} newName 
				 */
				changeName(newName) {
					self.data.name = newName.toLowerCase();
				}
			}));

			node.changeName('WORLD');

			assert.equal(
				node.innerHTML,
				"Hello world.",
				"the markup matches expected"
			);

			assert.equal(
				node.data.name,
				"world",
				"the data element is set correctly"
			);
		});

		QUnit.test("can be extended with additional, merged nested methods", async assert => {
			const node = html`<div>Hello ${text('name', '___')}.</div>`.extend(self => ({
				data: {
					/**
					 * This docstring should show up on the method also.
					 * 
					 * @param {string} newName 
					 */
					changeName(newName) {
						console.log({newName, self});
						self.data.name = newName.toLowerCase();
					}
				}
			}));

			node.data.changeName('WORLD');

			assert.equal(
				node.innerHTML,
				"Hello world.",
				"the markup matches expected"
			);

			assert.equal(
				node.data.name,
				"world",
				"the data element is set correctly"
			);
		});

		QUnit.test("can be extended with additional nested methods on new props", async assert => {
			const node = html`<div>Hello ${text('name', '___')}.</div>`.extend(self => ({
				extensions: {
					/**
					 * This docstring should show up on the method also.
					 * 
					 * @param {string} newName 
					 */
					changeName(newName) {
						console.log({newName, self});
						self.data.name = newName.toLowerCase();
					}
				}
			}));

			node.extensions.changeName('WORLD');

			assert.equal(
				node.innerHTML,
				"Hello world.",
				"the markup matches expected"
			);

			assert.equal(
				node.data.name,
				"world",
				"the data element is set correctly"
			);
		});


		// TODO: function interpolation tests
	});
});
