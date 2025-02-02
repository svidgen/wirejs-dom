/**
 * @template T
 * @typedef {{
* 	next: (item: T) => any
* }} Subscriber
*/

/**
 * @template T
 * @typedef {{
 *  signal: (item: T) => any
 * }} Signalable
 */


const collectionGroups = [];


/**
 * Creates a "context manager" that collects direct-descendent signals
 * that are resolved prior to exiting the scope.
 * 
 * @see [computed.js](./computed.js)
 */
export function * collectSignals() {
    try {
        const group = [];
        collectionGroups.push(group);
        yield group;
    } finally {
        collectionGroups.pop();
    }
};

function activeGroup() {
    return collectionGroups[collectionGroups.length - 1];
};

/**
* @template T
* @param {T?} value
*/
export function signal(value) {
    /**
     * @type {T | null}
     */
    let _value = value;

    /**
     * @type {Subscriber<T>[]}
     */
    const subscribers = [];

    return {
        /**
         * @returns {T | null}
         */
        get value() {
            if (activeGroup()) activeGroup().push(this);
            return _value;
        },

        /**
         * @param {T | null} newValue
         */
        set value(value) {
            _value = value;
            for (const s of subscribers) {
                if (typeof s === 'function') {
                    s(_value);
                } else if (typeof s?.next === 'function') {
                    s.next(_value);
                }
            }
        },

        valueOf() {
            return this.value;
        },

        toString() {
            return this.value?.toString() || '';
        },

        /**
         * 
         * @param {Subscriber<T> | Signalable<T>} subscriber - New subscriber.
         * @returns {(() => void)} Unsubscribe function.
         */
        subscribe(subscriber) {
            subscribers.push(subscriber);
            return () => {
                const i = subscribers.indexOf(subscriber);
                if (i >= 0) subscribers.splice(i, 1);
            };
        },

        /**
         * 
         * @param {Subscriber<T> | Signalable<T>} subscriber - New subscriber.
         * @returns {(() => void)} Unsubscribe function.
         */
        watch(watcher) {
            return this.subscribe(watcher);
        },
    };
};