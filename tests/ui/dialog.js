import QUnit from 'qunit';
import { Dialog, Button, _resetStyles } from '../../lib/ui/index.js';
QUnit.module('ui > Dialog', hooks => {
    hooks.beforeEach(() => {
        _resetStyles();
    });
    QUnit.test('renders a dialog element', assert => {
        const dlg = Dialog();
        assert.equal(dlg.tagName, 'DIALOG');
    });
    QUnit.test('has wj-dialog class', assert => {
        const dlg = Dialog();
        assert.ok(dlg.className.includes('wj-dialog'));
    });
    QUnit.test('renders title', assert => {
        const dlg = Dialog({ title: 'Confirm' });
        assert.ok(dlg.querySelector('.wj-dialog-title')?.textContent?.includes('Confirm'));
    });
    QUnit.test('renders children string', assert => {
        const dlg = Dialog({ children: 'Are you sure?' });
        assert.ok(dlg.querySelector('.wj-dialog-content')?.textContent?.includes('Are you sure?'));
    });
    QUnit.test('renders actions', assert => {
        const btn = Button({ label: 'OK' });
        const dlg = Dialog({ actions: [btn] });
        assert.ok(dlg.querySelector('.wj-dialog-actions button'), 'action button present');
    });
    QUnit.test('isOpen returns false by default', assert => {
        const dlg = Dialog();
        assert.false(dlg.isOpen(), 'dialog is not open by default');
    });
    QUnit.test('open option sets open state', assert => {
        const dlg = Dialog({ open: true });
        assert.true(dlg.isOpen(), 'dialog is open');
    });
    QUnit.test('close removes open attribute', assert => {
        const dlg = Dialog({ open: true });
        assert.true(dlg.isOpen());
        dlg.close();
        assert.false(dlg.isOpen());
    });
    QUnit.test('show adds open attribute', assert => {
        const dlg = Dialog();
        assert.false(dlg.isOpen());
        dlg.show();
        assert.true(dlg.isOpen());
    });
    QUnit.test('onClose callback fires when close event dispatched', assert => {
        let closed = false;
        const dlg = Dialog({ onClose: () => { closed = true; } });
        dlg.dispatchEvent(new Event('close'));
        assert.true(closed, 'onClose was called');
    });
});
