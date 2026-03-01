import QUnit from 'qunit';
import { List, ListItem, _resetStyles } from '../../../lib/ui/index.js';

QUnit.module('ui > List', hooks => {
	hooks.beforeEach(() => {
		_resetStyles();
	});

	QUnit.module('List', () => {
		QUnit.test('renders a ul element', assert => {
			const el = List();
			assert.equal(el.tagName, 'UL');
		});

		QUnit.test('has wj-list class', assert => {
			const el = List();
			assert.ok(el.className.includes('wj-list'));
		});

		QUnit.test('dense adds dense class', assert => {
			const el = List({ dense: true });
			assert.ok(el.className.includes('wj-list--dense'));
		});

		QUnit.test('disablePadding adds no-padding class', assert => {
			const el = List({ disablePadding: true });
			assert.ok(el.className.includes('wj-list--no-padding'));
		});

		QUnit.test('renders children', assert => {
			const item = ListItem({ primary: 'Item 1' });
			const el = List({ children: [item] });
			assert.ok(el.querySelector('li'), 'list item present');
		});
	});

	QUnit.module('ListItem', () => {
		QUnit.test('renders a li element', assert => {
			const el = ListItem();
			assert.equal(el.tagName, 'LI');
		});

		QUnit.test('has wj-list-item class', assert => {
			const el = ListItem();
			assert.ok(el.className.includes('wj-list-item'));
		});

		QUnit.test('renders primary text', assert => {
			const el = ListItem({ primary: 'Hello' });
			assert.ok(el.querySelector('.wj-list-item-primary')?.textContent?.includes('Hello'));
		});

		QUnit.test('renders secondary text', assert => {
			const el = ListItem({ primary: 'Main', secondary: 'Sub' });
			assert.ok(el.querySelector('.wj-list-item-secondary')?.textContent?.includes('Sub'));
		});

		QUnit.test('renders leading node', assert => {
			const icon = document.createElement('span');
			icon.className = 'icon';
			const el = ListItem({ leading: icon });
			assert.ok(el.querySelector('.wj-list-item-leading .icon'), 'leading icon present');
		});

		QUnit.test('renders trailing node', assert => {
			const badge = document.createElement('span');
			badge.className = 'badge';
			const el = ListItem({ trailing: badge });
			assert.ok(el.querySelector('.wj-list-item-trailing .badge'), 'trailing badge present');
		});

		QUnit.test('selected applies class and aria', assert => {
			const el = ListItem({ selected: true });
			assert.ok(el.className.includes('wj-list-item--selected'));
			assert.equal(el.getAttribute('aria-selected'), 'true');
		});

		QUnit.test('disabled applies class and aria', assert => {
			const el = ListItem({ disabled: true });
			assert.ok(el.className.includes('wj-list-item--disabled'));
			assert.equal(el.getAttribute('aria-disabled'), 'true');
		});

		QUnit.test('calls onClick when clicked', assert => {
			let clicked = false;
			const el = ListItem({ onClick: () => { clicked = true; } });
			el.click();
			assert.true(clicked, 'onClick was called');
		});
	});
});
