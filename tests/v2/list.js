import { html, list } from '../../lib/v2/index.js';
import QUnit from 'qunit';

/**
 * Open questions for list():
 * 
 * 1. what's the best or expected way these get placed into the DOM?
 * 2. when *reading* a list, what do we expect *back?* Do we expect the original items
 * back? Or do we expect the mapped items? Or both ...
 * 
 */

QUnit.module("v2", () => {
    QUnit.module('list', () => {
        QUnit.test("list() creates a list of nodes", assert => {
            const t = html`<div>before ${
                list('middle', ['a', 'b', 'c'])
            } after</div>`;

            console.log(t, t.data);

            // t.data.middle[1] = 'replaced!';

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
        });

        // QUnit.test("list() creates a list of nodes", assert => {
        //     const t = html`<div>before ${
        //         list('middle', (items = ['a', 'b', 'c']) => items)
        //     } after</div>`;

        //     console.log(t, t.data);
        // });

        // QUnit.test("list() creates a list of nodes", assert => {
        //     const t = html`<div>before ${
        //         list('middle', {data: ['a', 'b', 'c']})
        //     } after</div>`;

        //     console.log(t, t.data);
        // });

        // QUnit.test("list() creates a list of nodes", assert => {
        //     const t = html`<div>before ${
        //         list('middle', [1, 2, 3],
        //             /**
        //              * 
        //              * @param {number} item 
        //              * @returns 
        //              */
        //             item => html`<b>${item}</b>`
        //         )
        //     } after</div>`;

        //     console.log(t, t.data);
        // });

        // QUnit.test("list() creates a list of nodes", assert => {
        //     const t = html`<div>before ${
        //         list('middle', item => html`<b>${item}</b>`, ['a', 'b', 'c'])
        //     } after</div>`;

        //     console.log(t, t.data);
        // });

        // QUnit.test("list() creates a list of nodes", assert => {
        //     const t = html`<div>before ${
        //         list('middle').data(['a', 'b', 'c'])
        //     } after</div>`;

        //     console.log(t, t.data);
        // });

        // QUnit.test("list() creates a list of nodes", assert => {
        //     const t = html`<div>before ${
        //         list('middle').map(item => html`<b>${item}</b>`)
        //     } after</div>`;

        //     console.log(t, t.data);
        // });

        // QUnit.test("list() creates a list of nodes", assert => {
        //     const t = html`<div>before ${
        //         list('middle')
        //             .map(item => html`<b>${item}</b>`)
        //             .set(['a', 'b', 'c'])
        //     } after</div>`;

        //     console.log(t, t.data);
        // });

        // QUnit.test("list() creates a list of nodes", assert => {
        //     const t = html`<div>before ${
        //         list('middle')
        //             .set(['a', 'b', 'c'])
        //             .map(item => html`<b>${item}</b>`)
        //     } after</div>`;

        //     console.log(t, t.data);
        // });

        // QUnit.test("list() creates a list of nodes", assert => {
        //     const t = html`<div>before ${
        //         list('middle').set(['a', 'b', 'c'])
        //     } after</div>`;

        //     console.log(t, t.data);
        // });

    });
});