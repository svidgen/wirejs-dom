import { html, tag } from '../../lib/v2/index.js';
import QUnit from 'qunit';

/**
 * @type {import('../../lib/v2/types.js').SupportedTags[]}
 */
const supportedTags = ['span', 'div'];

QUnit.module('v2', _hooks => {
    QUnit.module('tag', _hooks => {
        for (const TAG of supportedTags) {
            QUnit.test(`tag.${TAG}\`\` injects a ${TAG} with a data-id`, assert => {
                const t = html`<div>before ${tag[TAG]('placeholder')} after</div>`;
            
                assert.equal(
                    t.innerHTML,
                    `before <${TAG} data-id="placeholder"></${TAG}> after`,
                    `the ${TAG} exists in the HTML`
                );
            });
            
            QUnit.test(`tag.${TAG}\`\` can receive default/init text`, assert => {
                const t = html`<div>before ${tag[TAG]('placeholder', 'some text')} after</div>`;
            
                assert.equal(
                    t.innerHTML,
                    `before <${TAG} data-id="placeholder">some text</${TAG}> after`,
                    `the ${TAG} exists in the HTML`
                );
            });
            
            QUnit.test(`tag.${TAG}\`\` adds a data getter to its innerHTML`, assert => {
                const { data } = html`<div>before ${tag[TAG]('placeholder', 'some inner html')} after</div>`;
            
                assert.equal(
                    data.placeholder,
                    'some inner html',
                    `the ${TAG} provides a data getter to its innerHTML`
                );
            });
            
            QUnit.test(`tag.${TAG}\`\` adds a data setter to its innerHTML`, assert => {
                const t = html`<div>before ${tag[TAG]('placeholder')} after</div>`;
                t.data.placeholder = 'added text';
            
                assert.equal(
                    t.innerHTML,
                    `before <${TAG} data-id="placeholder">added text</${TAG}> after`,
                    'the innerHTML is updated'
                );
                assert.equal(
                    t.data.placeholder,
                    'added text',
                    `the new ${TAG} text reads as expected`
                );
            });
        }
    });
});