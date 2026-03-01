import QUnit from 'qunit';
import { Typography, _resetStyles } from '../../../lib/ui/index.js';

QUnit.module('ui > Typography', hooks => {
	hooks.beforeEach(() => {
		_resetStyles();
	});

	QUnit.test('renders h1 tag for h1 variant', assert => {
		const el = Typography({ variant: 'h1', children: 'Title' });
		assert.equal(el.tagName, 'H1');
	});

	QUnit.test('renders h2 tag for h2 variant', assert => {
		const el = Typography({ variant: 'h2', children: 'Title' });
		assert.equal(el.tagName, 'H2');
	});

	QUnit.test('renders p tag for body1 variant', assert => {
		const el = Typography({ variant: 'body1', children: 'Text' });
		assert.equal(el.tagName, 'P');
	});

	QUnit.test('renders p tag for body2 variant', assert => {
		const el = Typography({ variant: 'body2', children: 'Text' });
		assert.equal(el.tagName, 'P');
	});

	QUnit.test('renders span tag for caption variant', assert => {
		const el = Typography({ variant: 'caption', children: 'Cap' });
		assert.equal(el.tagName, 'SPAN');
	});

	QUnit.test('renders span tag for overline variant', assert => {
		const el = Typography({ variant: 'overline', children: 'OL' });
		assert.equal(el.tagName, 'SPAN');
	});

	QUnit.test('applies variant class', assert => {
		const el = Typography({ variant: 'h3' });
		assert.ok(el.className.includes('wj-typography--h3'));
	});

	QUnit.test('renders children string', assert => {
		const el = Typography({ children: 'Hello World' });
		assert.ok(el.textContent?.includes('Hello World'));
	});

	QUnit.test('applies color style', assert => {
		const el = Typography({ color: 'red' });
		assert.equal(el.style.color, 'red');
	});

	QUnit.test('applies align class', assert => {
		const el = Typography({ align: 'center' });
		assert.ok(el.className.includes('wj-typography--align-center'));
	});

	QUnit.test('applies gutter bottom class', assert => {
		const el = Typography({ gutterBottom: true });
		assert.ok(el.className.includes('wj-typography--gutter-bottom'));
	});

	QUnit.test('default variant is body1', assert => {
		const el = Typography();
		assert.ok(el.className.includes('wj-typography--body1'));
	});
});
