import QUnit from 'qunit';
import { Container, Stack, Row, Section, _resetStyles } from '../../lib/ui/index.js';
QUnit.module('ui > Layout', hooks => {
    hooks.beforeEach(() => {
        _resetStyles();
    });
    QUnit.module('Container', () => {
        QUnit.test('renders a div', assert => {
            const el = Container();
            assert.equal(el.tagName, 'DIV');
        });
        QUnit.test('has wj-container class', assert => {
            const el = Container();
            assert.ok(el.className.includes('wj-container'));
        });
        QUnit.test('default maxWidth is lg', assert => {
            const el = Container();
            assert.ok(el.className.includes('wj-container--lg'));
        });
        QUnit.test('applies custom maxWidth', assert => {
            const el = Container({ maxWidth: 'sm' });
            assert.ok(el.className.includes('wj-container--sm'));
        });
        QUnit.test('has gutters by default', assert => {
            const el = Container();
            assert.ok(el.className.includes('wj-container--gutters'));
        });
        QUnit.test('disableGutters removes gutter class', assert => {
            const el = Container({ disableGutters: true });
            assert.notOk(el.className.includes('wj-container--gutters'));
        });
        QUnit.test('renders children', assert => {
            const child = document.createElement('p');
            child.textContent = 'hello';
            const el = Container({ children: child });
            assert.ok(el.querySelector('p'), 'child is present');
        });
    });
    QUnit.module('Stack', () => {
        QUnit.test('renders a div', assert => {
            const el = Stack();
            assert.equal(el.tagName, 'DIV');
        });
        QUnit.test('has wj-stack class', assert => {
            const el = Stack();
            assert.ok(el.className.includes('wj-stack'));
        });
        QUnit.test('default direction is column', assert => {
            const el = Stack();
            assert.ok(el.className.includes('wj-stack--column'));
        });
        QUnit.test('applies row direction', assert => {
            const el = Stack({ direction: 'row' });
            assert.ok(el.className.includes('wj-stack--row'));
        });
        QUnit.test('applies gap style', assert => {
            const el = Stack({ gap: 'md' });
            assert.equal(el.style.gap, '16px');
        });
        QUnit.test('applies custom gap string', assert => {
            const el = Stack({ gap: '20px' });
            assert.equal(el.style.gap, '20px');
        });
        QUnit.test('wrap adds wrap class', assert => {
            const el = Stack({ wrap: true });
            assert.ok(el.className.includes('wj-stack--wrap'));
        });
        QUnit.test('renders children', assert => {
            const child = document.createElement('span');
            const el = Stack({ children: child });
            assert.ok(el.querySelector('span'));
        });
    });
    QUnit.module('Row', () => {
        QUnit.test('renders a div with row direction', assert => {
            const el = Row();
            assert.ok(el.className.includes('wj-stack--row'));
        });
        QUnit.test('applies gap style', assert => {
            const el = Row({ gap: 'sm' });
            assert.equal(el.style.gap, '8px');
        });
    });
    QUnit.module('Section', () => {
        QUnit.test('renders a section element', assert => {
            const el = Section();
            assert.equal(el.tagName, 'SECTION');
        });
        QUnit.test('has wj-section class', assert => {
            const el = Section();
            assert.ok(el.className.includes('wj-section'));
        });
        QUnit.test('applies padding from Size', assert => {
            const el = Section({ padding: 'lg' });
            assert.equal(el.style.padding, '24px');
        });
        QUnit.test('applies custom padding string', assert => {
            const el = Section({ padding: '40px' });
            assert.equal(el.style.padding, '40px');
        });
    });
});
