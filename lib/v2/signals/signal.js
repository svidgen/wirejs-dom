/**
 * @template T
 * @typedef {{
* 	next: (item: T) => any
* }} Subscriber
*/

/**
* @template T
* @param {T?} value
* @returns 
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
            return _value;
        },

        toString() {
            return _value?.toString() || '';
        },

        /**
         * 
         * @param {Subscriber<T>} subscriber - New subscriber.
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
         * @param {Subscriber<T>} subscriber - New subscriber.
         * @returns {(() => void)} Unsubscribe function.
         */
        watch(watcher) {
            return this.subscribe(watcher);
        }
    }
}