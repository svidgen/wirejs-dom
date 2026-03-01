import QUnit from 'qunit';
import { Divider, _resetStyles } from '../../../lib/ui/index.js';

QUnit.module('ui > Divider', hooks => {
	hooks.beforeEach(() => {
		_resetStyles();
	});

	QUnit.test('renders an hr element', assert => {
		const el = Divider();
		assert.equal(el.tagName, 'HR');
	});

	QUnit.test('has wj-divider class', assert => {
		const el = Divider();
		assert.ok(el.className.includes('wj-divider'));
	});

	QUnit.test('default orientation is horizontal', assert => {
		const el = Divider();
		assert.ok(el.className.includes('wj-divider--horizontal'));
	});

	QUnit.test('vertical orientation applies class', assert => {
		const el = Divider({ orientation: 'vertical' });
		assert.ok(el.className.includes('wj-divider--vertical'));
	});

	QUnit.test('has separator role', assert => {
		const el = Divider();
		assert.equal(el.getAttribute('role'), 'separator');
	});

	QUnit.test('aria-orientation is set', assert => {
		const el = Divider({ orientation: 'vertical' });
		assert.equal(el.getAttribute('aria-orientation'), 'vertical');
	});

	QUnit.test('inset variant applies class', assert => {
		const el = Divider({ variant: 'inset' });
		assert.ok(el.className.includes('wj-divider--inset'));
	});

	QUnit.test('middle variant applies class', assert => {
		const el = Divider({ variant: 'middle' });
		assert.ok(el.className.includes('wj-divider--middle'));
	});

	QUnit.test('fullWidth variant does not apply extra class', assert => {
		const el = Divider({ variant: 'fullWidth' });
		assert.notOk(el.className.includes('wj-divider--fullWidth'));
	});
});
