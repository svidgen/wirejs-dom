import { randomId, getAttributeUnder } from '../util.js';

/**
 * @type {import('../types.ts').attribute}
 */
export function attribute(id, value = null) {
    const sentinelId = randomId();
    return {
        id,
        toString: () => sentinelId,
        bless: (context) => {
            const attr = getAttributeUnder(context.container, sentinelId);
            if (!attr) return;

            const node = attr.ownerElement;
            const attrName = attr.name;
            node[attrName] = value;

            // why does reading/writing to/fron attr.value directly not work here?
            return {
                /**
                 * @returns {import('./types.ts').Primitive | null}
                 */
                get() {
                    return node[attrName];
                },
                /**
                * @param {import('./types.ts').Primitive | null | Promise<import('./types.ts').Primitive | null>} value 
                */
                set(value) {
                    if (typeof value?.then === 'function') {
                        value.then(v => node[attrName] = v);
                    } else {
                        node[attrName] = value;
                    }
                }
            }
        },
    };
}