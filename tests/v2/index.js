import { html, id, span, handle, attribute } from '../../lib/v2/index.js';
import QUnit from 'qunit';

let fixture = document.createElement('div');
document.body.appendChild(fixture);

QUnit.testDone(() => {
    fixture.innerHTML = '';
});

QUnit.module("wirejs-v2");

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

QUnit.test("html`` can extract a node", assert => {
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

QUnit.test("html`` extracted node is mutable", assert => {
    const { data } = html`<div>
        before
        <div ${id('middle')}>middle</div>
        after
    </div>`;
    data.middle.innerHTML = 'changed'
    assert.equal(data.middle.innerHTML, 'changed', 'data has changed as expected');
});

QUnit.test("span`` injects a span with a data-id", assert => {
    const t = html`<div>before ${span('placeholder')} after</div>`;

    assert.equal(
        t.innerHTML,
        'before <span data-id="placeholder"></span> after',
        'the span exists in the HTML'
    );
});

QUnit.test("span`` can receive default/init text", assert => {
    const t = html`<div>before ${span('placeholder', 'some text')} after</div>`;

    assert.equal(
        t.innerHTML,
        'before <span data-id="placeholder">some text</span> after',
        'the span exists in the HTML'
    );
});

QUnit.test("span`` adds a data getter to its innerHTML", assert => {
    const { data } = html`<div>before ${span('placeholder', 'some inner html')} after</div>`;

    assert.equal(
        data.placeholder,
        'some inner html',
        'the span provides a data getter to its innerHTML'
    );
});

QUnit.test("span`` adds a data setter to its innerHTML", assert => {
    const t = html`<div>before ${span('placeholder')} after</div>`;
    t.data.placeholder = 'added text';

    assert.equal(
        t.innerHTML,
        'before <span data-id="placeholder">added text</span> after',
        'the innerHTML is updated'
    );
    assert.equal(
        t.data.placeholder,
        'added text',
        'the new span text reads as expected'
    );
});

QUnit.test("attribute`` can extract a node attribute", assert => {
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

// QUnit.test("html`` can attach an event handler", assert => {
//     const x = html`<div ${id('root')}>
//         something
//         <button onclick=${handle(() => handleClick())}>clicky click</button>
//     </div>`;

//     // type isn't being picked up correctly here...
//     x.data;
// });