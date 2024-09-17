import { html, list } from '../../lib/v2/index.js';
import QUnit from 'qunit';

QUnit.module("v2", () => {
    QUnit.module('list', () => {

        QUnit.test("list() creates a list of nodes", assert => {
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

        QUnit.test("list() created nodes can spliced out wholesale", assert => {
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

        QUnit.test("list() created nodes can spliced partially", assert => {
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

        QUnit.test("list() created nodes can be replaced individually", assert => {
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

        QUnit.test("list() created nodes can be replaced wholesale", assert => {
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

        QUnit.test("list() can be initialized empty and set later", assert => {
            const t = html`<div>before ${list('middle')} after</div>`;

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

    });
});