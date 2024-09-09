import { randomId, getAttributeUnder } from '../util.js';

/**
 * @type {import('../types.ts').list}
 */
export function list(id, mapperOrDataA, mapperOrDataB) {
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
                    // we need to return a list-like here, where all the list mutation
                    // operations are echoed to the DOM.
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
