// @ts-check
import { html, text, css } from '../../lib/v2/index.js';
import QUnit from 'qunit';
import allTags, { voidHtmlTags } from 'html-tags';

QUnit.module("v2", () => {
	QUnit.module('html`` tag compatibility', () => {
		for (const tag of allTags) {
			QUnit.test(`can create ${tag} tag`, assert => {
				// @ts-ignore
				const t = voidHtmlTags.includes(tag)
					? html`<${tag} />`
					: html`<${tag}></${tag}>`;
				assert.equal(
					t.tagName.toUpperCase(),
					tag.toUpperCase(),
					'tag name matches'
				);
			});
		}
	});
});
