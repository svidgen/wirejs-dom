import { html, text } from '../../lib/v2/index.js';
import QUnit from 'qunit';

QUnit.module("v2", () => {
    QUnit.module('text()', () => {
        QUnit.test("creates a text only hook", assert => {
            const t = html`<div>before ${text('middle', 'middle text')} after</div>`;

            assert.equal(
                t.innerHTML,
                "before middle text after",
                "tag innerHTML matches"
            );

            assert.equal(
                t.data.middle,
                "middle text",
                "data property of the text node matches"
            );
        });

        QUnit.test("prop can be written to", assert => {
            const t = html`<div>before ${text('middle', 'middle text')} after</div>`;

            t.data.middle = 'new text';

            assert.equal(
                t.innerHTML,
                "before new text after",
                "tag innerHTML matches"
            );

            assert.equal(
                t.data.middle,
                "new text",
                "data property of the text node matches"
            );
        });

        QUnit.test("prop does not render HTML", assert => {
            const t = html`<div>before ${text('middle', 'middle text')} after</div>`;

            t.data.middle = 'new <b>bold</b> next';

            assert.equal(
                t.innerHTML,
                "before new &lt;b&gt;bold&lt;/b&gt; next after",
                "tag innerHTML matches"
            );

            assert.equal(
                t.data.middle,
                "new <b>bold</b> next",
                "data property of the text node matches"
            );
        });

        QUnit.test("prop does not require default content", assert => {
            const t = html`<div>before ${text('middle')} after</div>`;

            assert.equal(
                t.innerHTML,
                "before  after",
                "tag innerHTML matches"
            );

            assert.equal(
                t.data.middle,
                undefined,
                "data property of the text node matches"
            );
        });

        QUnit.test("prop accepts promises and renders results", async assert => {
            const t = html`<div>before ${text('middle')} after</div>`;

            const v = Promise.resolve('middle value');

            // will require a be typecast in TS.
            t.data.middle = v;
            await v;

            assert.equal(
                t.innerHTML,
                "before middle value after",
                "tag innerHTML matches"
            );

            assert.equal(
                t.data.middle,
                'middle value',
                'data property of the text node matches'
            );
        });

        QUnit.test('can map values in (f, v) order', assert => {
            const t = html`<div>before ${
                text('middle', t => t.toUpperCase(), 'middle value')
            } after</div>`;

            assert.equal(
                t.innerHTML,
                "before MIDDLE VALUE after",
                "tag innerHTML matches"
            );

            assert.equal(
                t.data.middle,
                "middle value",
                "data property of the text node matches"
            );
        });

        QUnit.test('can update mapped values in (f, v) order', assert => {
            const t = html`<div>before ${
                text('middle', t => t.toUpperCase(), 'middle value')
            } after</div>`;

            t.data.middle = 'updated value';

            assert.equal(
                t.innerHTML,
                "before UPDATED VALUE after",
                "tag innerHTML matches"
            );

            assert.equal(
                t.data.middle,
                "updated value",
                "data property of the text node matches"
            );
        });

        QUnit.test('can map values in (v, f) order', assert => {
            const t = html`<div>before ${
                text('middle', 'middle value', t => t.toUpperCase())
            } after</div>`;

            assert.equal(
                t.innerHTML,
                "before MIDDLE VALUE after",
                "tag innerHTML matches"
            );

            assert.equal(
                t.data.middle,
                "middle value",
                "data property of the text node matches"
            );
        });

        QUnit.test('can update mapped values in (v, f) order', assert => {
            const t = html`<div>before ${
                text('middle', 'middle value', t => t.toUpperCase())
            } after</div>`;

            t.data.middle = 'updated value';

            assert.equal(
                t.innerHTML,
                "before UPDATED VALUE after",
                "tag innerHTML matches"
            );

            assert.equal(
                t.data.middle,
                "updated value",
                "data property of the text node matches"
            );
        });

        QUnit.test("can map values in f-only 'order'", assert => {
            const t = html`<div>before ${
                text('middle', () => 'constant value')
            } after</div>`;

            assert.equal(
                t.innerHTML,
                "before constant value after",
                "tag innerHTML matches"
            );

            assert.equal(
                t.data.middle,
                undefined,
                "data property of the text node matches"
            );
        });

        QUnit.test("can update mapped value in f-only order", assert => {
            const t = html`<div>before ${
                text('middle', t => t?.toUpperCase())
            } after</div>`;

            t.data.middle = 'updated value';

            assert.equal(
                t.innerHTML,
                "before UPDATED VALUE after",
                "tag innerHTML matches"
            );

            assert.equal(
                t.data.middle,
                "updated value",
                "data property of the text node matches"
            );
        });
    });
});