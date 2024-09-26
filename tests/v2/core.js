import { html, id, attribute } from '../../lib/v2/index.js';
import QUnit from 'qunit';

QUnit.module("v2", () => {

    QUnit.module('core', () => {
        QUnit.test("html`` returns the first element of the HTML", assert => {
            const t = html`<div>this is the <b>inner html!</b></div>`;
            assert.equal(
                t.innerHTML,
                'this is the <b>inner html!</b>',
                'innerHTML matches'
            );
        });
        
        QUnit.test("html`` can use custom tag names", assert => {
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
        
        QUnit.test("html`` can use namespaced tag names", assert => {
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
        
        QUnit.test("id() can extract a node", assert => {
            const { data } = html`<div>
                before
                <div ${id('middle')}>middle</div>
                after
            </div>`;
        
            assert.equal(
                data.middle.tagName,
                'DIV',
                "extracted node tag type is correct"
            );
            assert.equal(
                data.middle.innerHTML,
                'middle',
                "extracted node content matches"
            );
        });
        
        QUnit.test("id() extracted node is mutable", assert => {
            const { data } = html`<div>
                before
                <div ${id('middle')}>middle</div>
                after
            </div>`;
            data.middle.innerHTML = 'changed'
            assert.equal(data.middle.innerHTML, 'changed', 'data has changed as expected');
        });
   
        QUnit.test("attribute() can extract a node attribute", assert => {
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

        QUnit.test("attribute() can be written to", assert => {
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

        QUnit.test("attribute() can be written to with a promise", async assert => {
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
