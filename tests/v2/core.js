import { html, id, attribute } from '../../lib/v2/index.js';
import QUnit from 'qunit';

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
    });
});
