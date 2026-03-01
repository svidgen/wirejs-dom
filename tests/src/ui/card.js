import QUnit from 'qunit';
import { Card, Button, _resetStyles } from '../../../lib/ui/index.js';
QUnit.module('ui > Card', hooks => {
    hooks.beforeEach(() => {
        _resetStyles();
    });
    QUnit.test('renders as div element', assert => {
        const card = Card();
        assert.equal(card.tagName, 'DIV');
    });
    QUnit.test('has wj-card class', assert => {
        const card = Card();
        assert.ok(card.className.includes('wj-card'));
    });
    QUnit.test('renders title', assert => {
        const card = Card({ title: 'My Card' });
        assert.ok(card.querySelector('.wj-card-title'), 'title element exists');
        assert.ok(card.querySelector('.wj-card-title')?.textContent?.includes('My Card'));
    });
    QUnit.test('renders subtitle', assert => {
        const card = Card({ title: 'Title', subtitle: 'Sub' });
        assert.ok(card.querySelector('.wj-card-subtitle'), 'subtitle element exists');
        assert.ok(card.querySelector('.wj-card-subtitle')?.textContent?.includes('Sub'));
    });
    QUnit.test('no header when title is not provided', assert => {
        const card = Card();
        assert.notOk(card.querySelector('.wj-card-header'), 'no header');
    });
    QUnit.test('renders string children in content area', assert => {
        const card = Card({ children: 'Hello content' });
        assert.ok(card.querySelector('.wj-card-content')?.textContent?.includes('Hello content'));
    });
    QUnit.test('renders Node children', assert => {
        const p = document.createElement('p');
        p.textContent = 'Paragraph';
        const card = Card({ children: p });
        assert.ok(card.querySelector('.wj-card-content p'), 'node child rendered');
    });
    QUnit.test('renders actions', assert => {
        const btn = Button({ label: 'OK' });
        const card = Card({ actions: [btn] });
        assert.ok(card.querySelector('.wj-card-actions'), 'actions area exists');
        assert.ok(card.querySelector('.wj-card-actions button'), 'button in actions');
    });
    QUnit.test('elevated class applied', assert => {
        const card = Card({ elevated: true });
        assert.ok(card.className.includes('wj-card--elevated'));
    });
    QUnit.test('outlined class applied', assert => {
        const card = Card({ outlined: true });
        assert.ok(card.className.includes('wj-card--outlined'));
    });
    QUnit.test('calls onClick when clicked', assert => {
        let clicked = false;
        const card = Card({ onClick: () => { clicked = true; } });
        card.click();
        assert.true(clicked, 'onClick was called');
    });
});
