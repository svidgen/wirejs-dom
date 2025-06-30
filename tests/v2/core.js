// @ts-check
import { html, text, css } from '../../lib/v2/index.js';
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

		QUnit.test("can be a html element", assert => {
			const t = html`<html attr='something'><head><title>title</title></head></html>`;
			assert.equal(
				t.tagName,
				'HTML',
				'tag name is preserved'
			);
			assert.equal(
				t.outerHTML,
				`<html attr="something"><head><title>title</title></head><body></body></html>`,
				'outerHTML matches'
			);
		});

		QUnit.test("can be a full html document with doctype", assert => {
			const t = html`<!doctype html><html attr='something'><head><title>title</title></head></html>`;
			assert.equal(
				t.tagName,
				'HTML',
				'tag name is preserved'
			);
			assert.equal(
				t.outerHTML,
				`<html attr="something"><head><title>title</title></head><body></body></html>`,
				'outerHTML matches'
			);
			assert.equal(
				// @ts-ignore
				t.parentNode.doctype.name,
				`html`,
				"doctype matches"
			);
		});

		QUnit.test("can be a head element", assert => {
			const t = html`<head><title>title</title></head>`;
			assert.equal(
				t.tagName,
				'HEAD',
				'tag name is preserved'
			);
			assert.equal(
				t.outerHTML,
				'<head><title>title</title></head>',
				'outerHTML matches'
			);
		});

		QUnit.test("can be a body element", assert => {
			const t = html`<body><p>stuff</p></body>`;
			assert.equal(
				t.tagName,
				'BODY',
				'tag name is preserved'
			);
			assert.equal(
				t.outerHTML,
				'<body><p>stuff</p></body>',
				'outerHTML matches'
			);
		});

		QUnit.test("can contain interpolate other html`` directly", assert => {
			const child = html`<span>middle</span>`;
			const parent = html`<div>before ${child} after</div>`;

			assert.equal(
				parent.innerHTML,
				"before <span>middle</span> after",
				"the parent markup contains the child"
			);
		});

		QUnit.test("can contain interpolate other HTMLElements directly", assert => {
			const child = document.createElement('span')
			child.innerHTML = 'middle';
			const parent = html`<div>before ${child} after</div>`;
			assert.equal(
				parent.innerHTML,
				"before <span>middle</span> after",
				"the parent markup contains the child"
			);
		});

		QUnit.test("can contain interpolate html text directly - fragment", assert => {
			const child = "middle <b>child</b>";
			const parent = html`<div>before ${child} after</div>`;
			assert.equal(
				parent.innerHTML,
				"before middle <b>child</b> after",
				"the parent markup contains the child"
			);
		});

		QUnit.test("can contain interpolate html text directly - single full node", assert => {
			const child = "<p>middle <b>child</b></p>";
			const parent = html`<div>before ${child} after</div>`;
			assert.equal(
				parent.innerHTML,
				"before <p>middle <b>child</b></p> after",
				"the parent markup contains the child"
			);
		});

		QUnit.test("can interpolate html directly without interfering with types", assert => {
			const child = "<p>middle <b>child</b></p>";
			const parent = html`<div>${text('beforeText', 'before')} ${child} ${text('afterText', 'after')}</div>`;

			// @ts-expect-error
			const _test = parent.data.nonexistent;

			assert.equal(
				parent.data.beforeText,
				"before",
				"before text matches"
			);

			assert.equal(
				parent.data.afterText,
				"after",
				"before text matches"
			);

			assert.equal(
				parent.innerHTML,
				"before <p>middle <b>child</b></p> after",
				"the parent markup contains the child"
			);
		});

		QUnit.test("can interpolate html`` directly without interfering with types", assert => {
			const child = html`<p>middle <b>child</b></p>`;
			const parent = html`<div>${text('beforeText', 'before')} ${child} ${text('afterText', 'after')}</div>`;

			// @ts-expect-error
			const _test = parent.data.nonexistent;

			assert.equal(
				parent.data.beforeText,
				"before",
				"before text matches"
			);

			assert.equal(
				parent.data.afterText,
				"after",
				"before text matches"
			);

			assert.equal(
				parent.innerHTML,
				"before <p>middle <b>child</b></p> after",
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

			assert.equal(
				children[1].parentNode,
				parent,
				"the parent node contains the actual children (not copies)"
			)
		});

		QUnit.test("can contain a list of child raw HTMLElement directly", assert => {
			const children = ['a', 'b', 'c'].map(c => {
				const el = document.createElement('span');
				el.innerHTML = c;
				return el;
			});
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

		QUnit.test('immediately adds embedded HTMLStyleElement nodes to the head', assert => {
			const sheet = css`body { color: red; }`;
			const _node = html`<div>${sheet}Hello world.</div>`

			assert.equal(
				document.head.querySelector('style')?.textContent,
				sheet.textContent,
				'stylesheet is added to the document'
			);

			assert.equal(
				_node.innerHTML,
				"Hello world.",
				"the markup doesn't include any remnants of the sheet"
			);
		});

		// TODO: function interpolation tests
	});
});
