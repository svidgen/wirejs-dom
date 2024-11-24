import { html, list } from '../../lib/v2/index.js';
import QUnit from 'qunit';

QUnit.module("v2", () => {
	QUnit.module('list()', () => {
		QUnit.module('default mapping', () => {
			QUnit.test("creates a list of nodes", assert => {
				const t = html`<div>before ${
					list('middle', ['a', 'b', 'c'])
					} after</div>`;

				assert.equal(
					t.innerHTML,
					"before <div>a</div><div>b</div><div>c</div> after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					['a', 'b', 'c'],
					"data property of the text node matches"
				);

				assert.equal(
					t.data.middle.length,
					3,
					'data property reports the correct length'
				);
			});

			QUnit.test("data can be sliced", assert => {
				const t = html`<div>before ${
					list('middle', ['a', 'b', 'c', 'd', 'e', 'f'])
					} after</div>`;

				const sliced = t.data.middle.slice(1,4);

				assert.equal(
					t.innerHTML,
					"before <div>a</div><div>b</div><div>c</div><div>d</div><div>e</div><div>f</div> after",
					"tag innerHTML is retained"
				);

				assert.deepEqual(
					t.data.middle,
					['a', 'b', 'c', 'd', 'e', 'f'],
					"data property is retained"
				);

				assert.deepEqual(
					sliced,
					['b', 'c', 'd'],
					"sliced data matches"
				);
			});

			QUnit.test("data can spliced out wholesale", assert => {
				const t = html`<div>before ${
					list('middle', ['a', 'b', 'c'])
					} after</div>`;

				const removed = t.data.middle.splice(0);

				assert.equal(
					t.innerHTML,
					"before  after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					[],
					"data property of the text node matches"
				);

				assert.deepEqual(
					removed,
					['a', 'b', 'c'],
					"removed data matches"
				);
			});

			QUnit.test("data can spliced partially", assert => {
				const t = html`<div>before ${
					list('middle', ['a', 'b', 'c'])
					} after</div>`;

				const removed = t.data.middle.splice(1, 1);

				assert.equal(
					t.innerHTML,
					"before <div>a</div><div>c</div> after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					['a', 'c'],
					"data property of the text node matches"
				);

				assert.deepEqual(
					removed,
					['b'],
					"removed data matches"
				);
			});

			QUnit.test("items can be replaced individually", assert => {
				const t = html`<div>before ${
					list('middle', ['a', 'b', 'c'])
					} after</div>`;

				t.data.middle[1] = 'edited';

				assert.equal(
					t.innerHTML,
					"before <div>a</div><div>edited</div><div>c</div> after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					['a', 'edited', 'c'],
					"data property of the text node matches"
				);
			});

			QUnit.test("data can be replaced wholesale", assert => {
				const t = html`<div>before ${
					list('middle', ['a', 'b', 'c'])
					} after</div>`;

				t.data.middle = ['x', 'y', 'z'];

				assert.equal(
					t.innerHTML,
					"before <div>x</div><div>y</div><div>z</div> after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					['x', 'y', 'z'],
					"data property of the text node matches"
				);
			});

			QUnit.skip("items can be replaced with a promises", async assert => {
				// not yet implemented. not super high priority ... when we focus on this more,
				// we'll also want to focus on letting all list methods accept promises -- and for
				// those that accept lists of items, like `splice()` or `push()`'s N args, we'll
				// want to conditionally hook into the resolution/`.then()` of each item as well
				// as they top-level promise that is necessary. aiming at making this look like "magic"
				// eventually.
				const t = html`<div>before ${
					list('middle', ['a', 'b', 'c'])
					} after</div>`;

				const p = Promise.resolve('edited');

				// will require typecast in TS
				t.data.middle[1] = p;

				await p;

				assert.equal(
					t.innerHTML,
					"before <div>a</div><div>edited</div><div>c</div> after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					['a', 'edited', 'c'],
					"data property of the text node matches"
				);
			});

			QUnit.test("data can be replaced wholesale with a promise", async assert => {
				const t = html`<div>before ${
					list('middle', ['a', 'b', 'c'])
					} after</div>`;

				const p = Promise.resolve(['x', 'y', 'z']);

				// will require typecast in TS
				t.data.middle = p;

				await p;

				assert.equal(
					t.innerHTML,
					"before <div>x</div><div>y</div><div>z</div> after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					['x', 'y', 'z'],
					"data property of the text node matches"
				);
			});

			QUnit.test("can be initialized empty and set later", assert => {
				const t = html`<div>before ${list('middle', [1])} after</div>`;

				t.data.middle = ['x', 'y', 'z'];

				assert.equal(
					t.innerHTML,
					"before <div>x</div><div>y</div><div>z</div> after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					['x', 'y', 'z'],
					"data property of the text node matches"
				);
			});


			QUnit.test("can be pushed to", assert => {
				const t = html`<div>before ${
					list('middle', ['a', 'b', 'c'])
					} after</div>`;

				t.data.middle.push('d', 'e');

				assert.equal(
					t.innerHTML,
					"before <div>a</div><div>b</div><div>c</div><div>d</div><div>e</div> after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					['a', 'b', 'c', 'd', 'e'],
					"data property of the text node matches"
				);

				assert.equal(
					t.data.middle.length,
					5,
					'data property reports the correct length'
				);
			});

			QUnit.test("can be popped from", assert => {
				const t = html`<div>before ${
					list('middle', ['a', 'b', 'c'])
					} after</div>`;

				const popped = t.data.middle.pop();

				assert.equal(
					t.innerHTML,
					"before <div>a</div><div>b</div> after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					['a', 'b'],
					"data property of the text node matches"
				);

				assert.equal(
					t.data.middle.length,
					2,
					'data property reports the correct length'
				);

				assert.equal(
					popped,
					'c',
					'popped item matches the former last item'
				);
			});

			QUnit.test("can be unshifted to", assert => {
				const t = html`<div>before ${
					list('middle', ['a', 'b', 'c'])
					} after</div>`;

				t.data.middle.unshift('d', 'e');

				assert.equal(
					t.innerHTML,
					"before <div>d</div><div>e</div><div>a</div><div>b</div><div>c</div> after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					['d', 'e', 'a', 'b', 'c'],
					"data property of the text node matches"
				);

				assert.equal(
					t.data.middle.length,
					5,
					'data property reports the correct length'
				);
			});

			QUnit.test("can be shifted from", assert => {
				const t = html`<div>before ${
					list('middle', ['a', 'b', 'c'])
					} after</div>`;

				const shifted = t.data.middle.shift();

				assert.equal(
					t.innerHTML,
					"before <div>b</div><div>c</div> after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					['b', 'c'],
					"data property of the text node matches"
				);

				assert.equal(
					t.data.middle.length,
					2,
					'data property reports the correct length'
				);

				assert.equal(
					shifted,
					'a',
					'shifted item matches the former first item'
				);
			});

			QUnit.test("can be reversed", assert => {
				const t = html`<div>before ${
					list('middle', ['a', 'b', 'c'])
					} after</div>`;

				const reversed = t.data.middle.reverse();

				assert.equal(
					t.innerHTML,
					"before <div>c</div><div>b</div><div>a</div> after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					['c', 'b', 'a'],
					"data property of the text node matches"
				);

				assert.deepEqual(
					reversed,
					['c', 'b', 'a'],
					"returned value is the reversed data"
				);
			});

			QUnit.test("can be sorted using default string sort", assert => {
				const t = html`<div>before ${
					list('middle', ['b', 'd', 'c', 'a'])
					} after</div>`;

				const sorted = t.data.middle.sort();

				assert.equal(
					t.innerHTML,
					"before <div>a</div><div>b</div><div>c</div><div>d</div> after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					['a', 'b', 'c', 'd'],
					"data property of the text node matches"
				);

				assert.deepEqual(
					sorted,
					['a', 'b', 'c', 'd'],
					"returned value is the sorted data"
				);
			});

			QUnit.test("can be sorted using arbitrary sort", assert => {
				const t = html`<div>before ${
					list('middle', ['b', 'd', 'c', 'a'])
					} after</div>`;

				const sortOrder = ['d', 'b', 'a', 'c'];
				const byArbitrary = (a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b);

				const sorted = t.data.middle.sort(byArbitrary);

				assert.equal(
					t.innerHTML,
					"before <div>d</div><div>b</div><div>a</div><div>c</div> after",
					"tag innerHTML matches"
				);

				console.log(t.outerHTML);

				assert.deepEqual(
					t.data.middle,
					['d', 'b', 'a', 'c'],
					"data property of the text node matches"
				);

				assert.deepEqual(
					sorted,
					['d', 'b', 'a', 'c'],
					"returned value is the sorted data"
				);
			});
		});

		QUnit.module('custom mapping', () => {
			QUnit.test("creates a list of nodes", assert => {
				const t = html`<div>before ${
					list('middle', [4, 5, 6],
						/**
						 * @param {number} n
						 * */
						n => html`<span>Number ${n}</span>`
					)
					} after</div>`;

				assert.equal(
					t.innerHTML,
					"before <span>Number 4</span><span>Number 5</span><span>Number 6</span> after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					[4, 5, 6],
					"data property of the text node matches"
				);

				assert.equal(
					t.data.middle.length,
					3,
					'data property reports the correct length'
				);
			});

			QUnit.test("data can be sliced", assert => {
				const t = html`<div>before ${
					list('middle', [4, 5, 6, 7, 8, 9],
						/**
						 * @param {number} n
						 * */
						n => html`<span>Number ${n}</span>`
					)
					} after</div>`;

				const sliced = t.data.middle.slice(1, 4)

				assert.equal(
					t.innerHTML,
					[
						"before ",
						"<span>Number 4</span><span>Number 5</span><span>Number 6</span>",
						"<span>Number 7</span><span>Number 8</span><span>Number 9</span>",
						" after"
					].join(''),
					"tag innerHTML matches after slice"
				);

				assert.deepEqual(
					sliced,
					[5, 6, 7],
					"sliced data matches"
				);

				assert.deepEqual(
					t.data.middle,
					[4, 5, 6, 7, 8, 9],
					"data property of the text node still matches"
				)
			});

			QUnit.test("items can be updated individually", assert => {
				const t = html`<div>before ${
					list('middle', [4, 5, 6],
						/**
						 * @param {number} n
						 * */
						n => html`<span>Number ${n}</span>`
					)
					} after</div>`;

				t.data.middle[1] = 10;

				assert.equal(
					t.innerHTML,
					"before <span>Number 4</span><span>Number 10</span><span>Number 6</span> after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					[4, 10, 6],
					"data property of the text node matches"
				);

				assert.equal(
					t.data.middle.length,
					3,
					'data property reports the correct length'
				);
			});

			QUnit.test("items can be sorted", assert => {
				const t = html`<div>before ${
					list('middle', [8, 1, 7],
						/**
						 * @param {number} n
						 * */
						n => html`<span>Number ${n}</span>`
					)
					} after</div>`;

				t.data.middle.sort((a, b) => a - b);

				assert.equal(
					t.innerHTML,
					"before <span>Number 1</span><span>Number 7</span><span>Number 8</span> after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					[1, 7, 8],
					"data property of the text node matches"
				);
			});

			QUnit.test("chainable Array methods can be chained", assert => {
				const t = html`<div>before ${
					list('middle', [8, 1, 7],
						/**
						 * @param {number} n
						 * */
						n => html`<span>Number ${n}</span>`
					)
					} after</div>`;

				t.data.middle
					.sort((a, b) => a - b)
					.reverse()
					.sort((a, b) => a - b)
					.reverse()
				;

				assert.equal(
					t.innerHTML,
					"before <span>Number 8</span><span>Number 7</span><span>Number 1</span> after",
					"tag innerHTML matches"
				);

				assert.deepEqual(
					t.data.middle,
					[8, 7, 1],
					"data property of the text node matches"
				);
			});
		})
	});
});
