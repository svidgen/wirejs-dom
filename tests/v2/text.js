import { html, text } from '../../lib/v2/index.js';
import QUnit from 'qunit';

QUnit.module("v2", () => {
    QUnit.module('text', () => {
        QUnit.test("text() creates a text only hook", assert => {
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

        QUnit.test("text() hook can be written to", assert => {
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

        QUnit.test("text() hook does not render HTML", assert => {
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

        QUnit.test("text() hook does not require default content", assert => {
            const t = html`<div>before ${text('middle')} after</div>`;

            assert.equal(
                t.innerHTML,
                "before  after",
                "tag innerHTML matches"
            );

            assert.equal(
                t.data.middle,
                "",
                "data property of the text node matches"
            );
        });
    });
});