import QUnit from 'qunit';
import { TextField, _resetStyles } from '../../../lib/ui/index.js';
QUnit.module('ui > TextField', hooks => {
    hooks.beforeEach(() => {
        _resetStyles();
    });
    QUnit.test('renders wrapper element', assert => {
        const field = TextField();
        assert.equal(field.tagName, 'DIV');
    });
    QUnit.test('has wj-textfield class', assert => {
        const field = TextField();
        assert.ok(field.className.includes('wj-textfield'));
    });
    QUnit.test('renders an input element', assert => {
        const field = TextField();
        assert.ok(field.querySelector('input'), 'input is present');
    });
    QUnit.test('renders label when provided', assert => {
        const field = TextField({ label: 'Email' });
        assert.ok(field.querySelector('label'), 'label is present');
        assert.ok(field.querySelector('label')?.textContent?.includes('Email'));
    });
    QUnit.test('getValue returns empty string by default', assert => {
        const field = TextField();
        assert.equal(field.getValue(), '');
    });
    QUnit.test('getValue returns initial value', assert => {
        const field = TextField({ value: 'hello' });
        assert.equal(field.getValue(), 'hello');
    });
    QUnit.test('setValue updates the input value', assert => {
        const field = TextField();
        field.setValue('world');
        assert.equal(field.getValue(), 'world');
    });
    QUnit.test('onChange callback fires on change event', assert => {
        let changed = '';
        const field = TextField({ onChange: v => { changed = v; } });
        const input = field.querySelector('input');
        input.value = 'new';
        input.dispatchEvent(new window.Event('change'));
        assert.equal(changed, 'new');
    });
    QUnit.test('onInput callback fires on input event', assert => {
        let inputted = '';
        const field = TextField({ onInput: v => { inputted = v; } });
        const input = field.querySelector('input');
        input.value = 'typing';
        input.dispatchEvent(new window.Event('input'));
        assert.equal(inputted, 'typing');
    });
    QUnit.test('disabled input is disabled', assert => {
        const field = TextField({ disabled: true });
        const input = field.querySelector('input');
        assert.true(input.disabled);
    });
    QUnit.test('fullWidth applies class', assert => {
        const field = TextField({ fullWidth: true });
        assert.ok(field.className.includes('wj-textfield--full-width'));
    });
    QUnit.test('error string applies error class', assert => {
        const field = TextField({ error: 'Required' });
        assert.ok(field.className.includes('wj-textfield--error'));
    });
    QUnit.test('helperText is rendered', assert => {
        const field = TextField({ helperText: 'Some hint' });
        assert.ok(field.querySelector('.wj-textfield-helper')?.textContent?.includes('Some hint'));
    });
});
