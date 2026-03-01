import QUnit from 'qunit';
import { applyTheme, createTheme, lightTheme, darkTheme, _resetStyles } from '../../../lib/ui/index.js';
QUnit.module('ui > theme', hooks => {
    hooks.beforeEach(() => {
        _resetStyles();
    });
    QUnit.test('lightTheme has primary color', assert => {
        assert.equal(lightTheme.colors.primary, '#6750A4');
    });
    QUnit.test('darkTheme has different primary color', assert => {
        assert.notEqual(darkTheme.colors.primary, lightTheme.colors.primary);
    });
    QUnit.test('applyTheme sets CSS custom properties on element', assert => {
        const el = document.createElement('div');
        applyTheme(lightTheme, el);
        assert.equal(el.style.getPropertyValue('--wj-primary'), '#6750A4');
    });
    QUnit.test('applyTheme sets secondary color', assert => {
        const el = document.createElement('div');
        applyTheme(lightTheme, el);
        assert.equal(el.style.getPropertyValue('--wj-secondary'), '#625B71');
    });
    QUnit.test('applyTheme sets surface color', assert => {
        const el = document.createElement('div');
        applyTheme(lightTheme, el);
        assert.equal(el.style.getPropertyValue('--wj-surface'), '#FEF7FF');
    });
    QUnit.test('createTheme merges overrides into lightTheme', assert => {
        const custom = createTheme({ colors: { primary: '#FF0000' } });
        assert.equal(custom.colors.primary, '#FF0000');
        assert.equal(custom.colors.secondary, lightTheme.colors.secondary);
    });
    QUnit.test('createTheme deep merges nested properties', assert => {
        const custom = createTheme({ typography: { fontFamily: 'Arial' } });
        assert.equal(custom.typography.fontFamily, 'Arial');
        assert.equal(custom.typography.fontSize, lightTheme.typography.fontSize);
    });
    QUnit.test('applyTheme sets spacing values', assert => {
        const el = document.createElement('div');
        applyTheme(lightTheme, el);
        assert.equal(el.style.getPropertyValue('--wj-spacing-md'), '16px');
    });
});
