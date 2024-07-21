import { randomId, getAttributeUnder } from '../util.js';

/**
 * @type {import('../types.ts').attribute}
 */
export function attribute(id, value) {
    const sentinelId = randomId();
    return {
        id,
        toString: () => sentinelId,
        bless: (context) => {
            const attribute = getAttributeUnder(context.container, sentinelId);
            if (!attribute) return;
            attribute.value = value;
            return {
                /**
                 * @returns {import('./types.ts').Primitive | null}
                 */
                get() {
                    return attribute.value;
                },
                /**
                * @param {import('./types.ts').Primitive | null} value 
                */
                set(value) {
                    attribute.value = value;
                }
            }
        },
    };
}
