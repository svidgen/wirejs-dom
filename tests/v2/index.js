import { html, id, text, handle } from '../../lib/v2';
const QUnit = require('qunit');

QUnit.testStart(() => {
	DomClass.clear();
	fixture.innerHTML = '';
});

QUnit.module("wirejs-v2");

QUnit.test("", assert => {
    const x = html`<div ${id('root')}>
        ${text('someid')}
    </div>`;

    // type isn't being picked up correctly here...
    x.data;
});