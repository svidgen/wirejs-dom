import QUnit from 'qunit';
import { Chip, _resetStyles } from '../../../lib/ui/index.js';

QUnit.module('ui > Chip', hooks => {
	hooks.beforeEach(() => {
		_resetStyles();
	});

	QUnit.test('renders an element', assert => {
		const chip = Chip({ label: 'Tag' });
		assert.ok(chip);
	});

	QUnit.test('has wj-chip class', assert => {
		const chip = Chip();
		assert.ok(chip.className.includes('wj-chip'));
	});

	QUnit.test('default variant is filled', assert => {
		const chip = Chip();
		assert.ok(chip.className.includes('wj-chip--filled'));
	});

	QUnit.test('outlined variant applies class', assert => {
		const chip = Chip({ variant: 'outlined' });
		assert.ok(chip.className.includes('wj-chip--outlined'));
	});

	QUnit.test('label text is present', assert => {
		const chip = Chip({ label: 'Hello' });
		assert.ok(chip.textContent?.includes('Hello'));
	});

	QUnit.test('calls onClick when clicked', assert => {
		let clicked = false;
		const chip = Chip({ onClick: () => { clicked = true; } });
		chip.click();
		assert.true(clicked, 'onClick was called');
	});

	QUnit.test('selected state sets aria-selected', assert => {
		const chip = Chip({ selected: true });
		assert.equal(chip.getAttribute('aria-selected'), 'true');
	});

	QUnit.test('disabled state sets aria-disabled', assert => {
		const chip = Chip({ disabled: true });
		assert.equal(chip.getAttribute('aria-disabled'), 'true');
	});

	QUnit.test('onDelete renders delete button', assert => {
		const chip = Chip({ label: 'Tag', onDelete: () => {} });
		assert.ok(chip.querySelector('.wj-chip-delete'), 'delete button present');
	});

	QUnit.test('onDelete callback is called when delete button clicked', assert => {
		let deleted = false;
		const chip = Chip({ label: 'Tag', onDelete: () => { deleted = true; } });
		const deleteBtn = chip.querySelector('.wj-chip-delete') as HTMLElement;
		deleteBtn.click();
		assert.true(deleted, 'onDelete was called');
	});

	QUnit.test('color class is applied', assert => {
		const chip = Chip({ color: 'primary' });
		assert.ok(chip.className.includes('wj-chip--color-primary'));
	});
});
