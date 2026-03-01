import QUnit from 'qunit';
import { Button, _resetStyles } from '../../lib/ui/index.js';
QUnit.module('ui > Button', hooks => {
    hooks.beforeEach(() => {
        _resetStyles();
    });
    QUnit.test('renders with label string', assert => {
        const btn = Button({ label: 'Click me' });
        assert.ok(btn.textContent?.includes('Click me'), 'label text is present');
    });
    QUnit.test('renders as button element', assert => {
        const btn = Button();
        assert.equal(btn.tagName, 'BUTTON');
    });
    QUnit.test('default variant is filled', assert => {
        const btn = Button();
        assert.ok(btn.className.includes('wj-btn--filled'));
    });
    QUnit.test('applies variant class', assert => {
        const btn = Button({ variant: 'outlined' });
        assert.ok(btn.className.includes('wj-btn--outlined'));
    });
    QUnit.test('applies size class', assert => {
        const btn = Button({ size: 'large' });
        assert.ok(btn.className.includes('wj-btn--large'));
    });
    QUnit.test('calls onClick when clicked', assert => {
        let clicked = false;
        const btn = Button({ onClick: () => { clicked = true; } });
        btn.click();
        assert.true(clicked, 'onClick was called');
    });
    QUnit.test('disabled button has disabled attribute', assert => {
        const btn = Button({ disabled: true });
        assert.true(btn.disabled, 'button is disabled');
    });
    QUnit.test('button type attribute is set', assert => {
        const btn = Button({ type: 'submit' });
        assert.equal(btn.getAttribute('type'), 'submit');
    });
    QUnit.test('fullWidth applies class', assert => {
        const btn = Button({ fullWidth: true });
        assert.ok(btn.className.includes('wj-btn--full-width'));
    });
    QUnit.test('default button type is button', assert => {
        const btn = Button();
        assert.equal(btn.getAttribute('type'), 'button');
    });
    QUnit.test('renders with Node label', assert => {
        const span = document.createElement('span');
        span.textContent = 'Node Label';
        const btn = Button({ label: span });
        assert.ok(btn.querySelector('span'), 'node label is present');
    });
});
