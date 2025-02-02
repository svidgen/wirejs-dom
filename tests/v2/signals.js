// import { signal, reactive, computed } from '../../lib/v2/index.js';
import { signal, reactive, computed } from '../../src/lib/v2/signals/index.js';
import QUnit from 'qunit';

QUnit.module("v2", () => {
	QUnit.module('signals', () => {
		QUnit.test("signal() creates an object with a value", assert => {
			const variable = signal('a');

			assert.equal(
				variable.value,
				'a',
				"the variable starts with its initial value"
			);
			assert.equal(
				variable.valueOf(),
				'a',
				"the valueOf() matches"
			);
			assert.equal(
				variable.toString(),
				'a',
				"the toString() matches"
			);
		});

		QUnit.test("signal() values can be observed when changed", assert => {
			const variable = signal('a');
			let observedValue = null;
			variable.watch(v => observedValue = v);
			variable.value = 'b';

			assert.equal(
				variable.value,
				'b',
				"the variable now has the new, updated value"
			);
			assert.equal(
				observedValue,
				'b',
				"the watcher callback was fired, containing the new value"
			);
		});

		QUnit.test("reactive`` creates a signal with a string value", assert => {
			const s = reactive`string value`;

			assert.equal(
				s.value,
				'string value',
				"The value property matches"
			);

			assert.equal(
				s.toString(),
				'string value',
				"The toString() matches"
			);

			assert.equal(
				s.valueOf(),
				'string value',
				"The valueOf() matches"
			);
		});

		QUnit.test("reactive`` can interpolate signals", assert => {
			const name = signal('world');
			const greeting = reactive`Hello, ${name}.`;

			assert.equal(
				greeting.value,
				'Hello, world.',
				"The value property matches"
			);

			assert.equal(
				greeting.toString(),
				'Hello, world.',
				"The toString() matches"
			);

			assert.equal(
				greeting.valueOf(),
				'Hello, world.',
				"The valueOf() matches"
			);
		});

		QUnit.test("reactive`` updates when interpolated signals change", assert => {
			const name = signal('???');
			const greeting = reactive`Hello, ${name}.`;

			let observedValue = null;
			greeting.watch(v => observedValue = v);
			name.value = 'world';

			assert.equal(
				greeting.value,
				'Hello, world.',
				"The value property matches"
			);

			assert.equal(
				greeting.toString(),
				'Hello, world.',
				"The toString() matches"
			);

			assert.equal(
				greeting.valueOf(),
				'Hello, world.',
				"The valueOf() matches"
			);

			assert.equal(
				observedValue,
				'Hello, world.',
				"The observed value matches"
			);
		});

		QUnit.test("reactive`` can interpolate other reactives", assert => {
			const firstName = signal('Bob');
			const lastName = signal('Jones');
			const name = reactive`${firstName} ${lastName}`;
			const greeting = reactive`Hello, ${name}.`;

			assert.equal(
				greeting.value,
				'Hello, Bob Jones.',
				"The value property matches"
			);

			assert.equal(
				greeting.toString(),
				'Hello, Bob Jones.',
				"The toString() matches"
			);

			assert.equal(
				greeting.valueOf(),
				'Hello, Bob Jones.',
				"The valueOf() matches"
			);
		});

		QUnit.test("reactive`` updates when interpolated reactives change", assert => {
			const firstName = signal('Bob');
			const lastName = signal('???');
			const name = reactive`${firstName} ${lastName}`;
			const greeting = reactive`Hello, ${name}.`;

			let observedValue = null;
			greeting.watch(v => observedValue = v);
			lastName.value = 'Jones';

			assert.equal(
				greeting.value,
				'Hello, Bob Jones.',
				"The value property matches"
			);

			assert.equal(
				greeting.toString(),
				'Hello, Bob Jones.',
				"The value property matches"
			);

			assert.equal(
				greeting.valueOf(),
				'Hello, Bob Jones.',
				"The value property matches"
			);

			assert.equal(
				greeting.valueOf(),
				'Hello, Bob Jones.',
				"The observed value matches"
			);
		});

		QUnit.test('computed() can return a basic value', assert => {
			const sum = computed(() => 1 + 2);

			assert.equal(
				sum,
				3,
				"the computed value was returned"
			);
		});

		QUnit.test('computed() can return a value based on signals', assert => {
			const width = signal(3);
			const height = signal(4);
			const area = computed(() => width * height);

			assert.equal(
				area,
				12,
				"the computed value was returned"
			);
		});

		QUnit.test('computed() updates when inner signals change', assert => {
			const width = signal(3);
			const height = signal(4);
			const area = computed(() => width * height);

			let observedValue = null;
			area.watch(v => observedValue = v);
			width.value = 5;

			assert.equal(
				area,
				20,
				"the newly computed value was returned"
			);

			assert.equal(
				observedValue,
				20,
				"the observed value change matches"
			);
		});

		QUnit.test('computed() updates when multiple inner signals change', assert => {
			const width = signal(3);
			const height = signal(4);
			const area = computed(() => width * height);

			let observedValue = null;
			area.watch(v => observedValue = v);

			width.value = 5;
			height.value = 10;

			assert.equal(
				area,
				50,
				"the newly computed value was returned"
			);

			assert.equal(
				observedValue,
				50,
				"the observed value change matches"
			);
		});

		QUnit.test('computed() can depend on other computed values', assert => {
			const width = signal(3);
			const height = signal(4);
			const depth = signal(5);
			const area = computed(() => width * height);
			const volume = computed(() => area * depth);

			assert.equal(
				volume,
				3 * 4 * 5,
				"the initial computed value matches the expected value"
			);

			let observedValue = null;
			volume.watch(v => observedValue = v);

			width.value = 5;
			height.value = 10;
			depth.value = 20;

			assert.equal(
				volume,
				5 * 10 * 20,
				"the newly computed value was returned"
			);

			assert.equal(
				observedValue,
				5 * 10 * 20,
				"the observed value change matches"
			);
		});
	});
});
