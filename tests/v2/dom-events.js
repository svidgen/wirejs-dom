import { registerNodeDomCallbacks } from '../../lib/v2/components/dom-events.js';
import QUnit, { test } from 'qunit';

// NOTE: The callbacks provided by the browser (and therefore this library) are not
// immediate. Hence, the async testing patterns.

async function sleep(ms = 1) {
    return new Promise(unsleep => setTimeout(unsleep, ms));
}

QUnit.module('v2', () => {
    QUnit.module('dom-events', () => {
        test('registerNodeDomCallbacks() does not fire callbacks on no-op', async assert => {
            const node = document.createElement('div');

            const event = new Promise(resolve => {
                registerNodeDomCallbacks(node, {
                    onadd() { resolve('onadd') },
                    onremove() { resolve('onremove') }
                });

                // no idea how long this timeout really needs to be, but in Chrome a sleep
                // of 15 ms gives us a very wide berth. based on the timings provided by QUnit
                // in subsequent tests *for* the events, MutationObserver (and therefore the
                // events we're watching for) fire within a single ms.
                sleep(10).then(() => resolve('unsleep'));
            });
            
            assert.equal(await event, 'unsleep', "neither callback fired prematurely");
        });

        test('registerNodeDomCallbacks() fires onadd() on document insert', async assert => {
            const node = document.createElement('div');

            const event = new Promise((resolve, reject) => {
                registerNodeDomCallbacks(node, {
                    onadd() { resolve('onadd') },
                    onremove() { resolve('onremove') }
                });
                sleep(10).then(() => reject('Timed out'));
            });

            document.body.appendChild(node);

            assert.equal(await event, 'onadd', 'onadd() callback fired');
        });

        test('registerNodeDomCallbacks() fires onremove() on document removal', async assert => {
            const node = document.createElement('div');

            const event = new Promise((resolve, reject) => {
                registerNodeDomCallbacks(node, {
                    onadd() { },
                    onremove() { resolve('onremove') }
                });
                sleep(100).then(() => reject('Timed out'));
            });

            document.body.appendChild(node);

            // a short sleep is required to ensure the underlying MutationObserver sees
            // the node enter the DOM. otherwise, it reports the addition and removal in
            // a single event, and wirejs treats it like a no-op.
            await sleep();

            document.body.removeChild(node);

            assert.equal(await event, 'onremove', 'onremove() callback fired');
        });
    })
});