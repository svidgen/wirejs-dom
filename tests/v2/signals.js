import { signal, reactive } from '../../lib/v2/index.js';
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
    });
});