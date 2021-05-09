const reflect = require('../lib/reflect');

QUnit.module('reflect');

QUnit.test("can mirror existing object properties", assert => {
	const source = {a: 123};
	const target = {};

	const mirror = reflect(source).onto(target);
	source.a += 1;

	assert.equal(source.a, 124);
	assert.equal(target.a, 124);
});

QUnit.test("can mirror not-yet-existing properties when explicitly requested", assert => {
	const source = {};
	const target = {};

	const mirror = reflect(source, ['a']).onto(target);
	source.a = 123;

	assert.equal(source.a, 123);
	assert.equal(target.a, 123);
});

QUnit.test("can mirror to multiple targets", assert => {
	const source = {};
	const target1 = {};
	const target2 = {};

	const mirror1 = reflect(source, ['a']).onto(target1);
	const mirror2 = reflect(source, ['a']).onto(target2);
	source.a = 'abc';

	assert.equal(source.a, 'abc');
	assert.equal(target1.a, 'abc');
	assert.equal(target2.a, 'abc');
});

QUnit.test("can mirror properties to functions", assert => {
	const source = {};
	const target = { a: v => { target._calledWith = v; } };

	const mirror = reflect(source, ['a']).onto(target);
	source.a = 'abc';

	assert.equal(source.a, 'abc');
	assert.equal(target._calledWith, 'abc');
	assert.equal(typeof target.a, 'function', "the monitoring function should not be tampered with");
});

QUnit.test("can mirror functions to functions", assert => {
	const source = { a: v => {} };
	const target = { a: function(v) { this._calledWith = v; } };

	const mirror = reflect(source).onto(target);
	source.a('abc');

	assert.equal(typeof source.a, 'function', "a() should still be intact as a function on the source");
	assert.equal(typeof target.a, 'function', "a() should still be intact as a function on the target");
	assert.equal(target._calledWith, 'abc');
});
