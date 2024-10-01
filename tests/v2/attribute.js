import { html, id, attribute } from '../../lib/v2/index.js';
import QUnit from 'qunit';

QUnit.module("v2", () => {
    QUnit.module('attribute()', () => {
        QUnit.test("can extract a node attribute", assert => {
            const { data } = html`<div>
                before
                <div
                    ${id('middle')}
                    title=${attribute('middleTitle', 'default value')}
                >middle</div>
                after
            </div>`;
        
            assert.equal(
                data.middle.getAttribute('title'),
                'default value',
                "attribute is created with default value"
            )
            assert.equal(
                data.middleTitle,
                'default value',
                "extracted data property reads the attribute"
            );
        });

        QUnit.test("can be written to", assert => {
            const { data } = html`<div>
                before
                <div
                    ${id('middle')}
                    title=${attribute('middleTitle', 'default value')}
                >middle</div>
                after
            </div>`;
        
            data.middleTitle = 'new title';
        
            assert.equal(
                data.middle.getAttribute('title'),
                'new title',
                "attribute updates are reflected in the DOM"
            )
            assert.equal(
                data.middleTitle,
                'new title',
                "attribute updates are reflected in the getter"
            );
        });

        QUnit.test("can be written to with a promise", async assert => {
            const { data } = html`<div>
                before
                <div
                    ${id('middle')}
                    title=${attribute('middleTitle', 'default value')}
                >middle</div>
                after
            </div>`;
        
            const p = Promise.resolve('new title');

            // will need a typecast in TS
            data.middleTitle = p;

            await p;
        
            assert.equal(
                data.middle.getAttribute('title'),
                'new title',
                "attribute updates are reflected in the DOM"
            )
            assert.equal(
                data.middleTitle,
                'new title',
                "attribute updates are reflected in the getter"
            );
        });
    });
});
