import { randomId, getAttributeUnder } from '../util.js';

/**
 * @type {import('../types.ts').attribute}
 */
export function attribute(id, mapperOrDataA, mapperOrDataB) {
    const map =
        typeof mapperOrDataA === 'function' ? mapperOrDataA :
        typeof mapperOrDataB === 'function' ? mapperOrDataB :
        item => item ?? ''
    ;

    const initialValue =
        typeof mapperOrDataA === 'function' ? mapperOrDataB : mapperOrDataA
    ;

    const sentinelId = randomId();
    return {
        id,
        toString: () => sentinelId,
        bless: (context) => {
            const attr = getAttributeUnder(context.container, sentinelId);
            if (!attr) return;

            const node = attr.ownerElement;
            const attrName = attr.name;
            let innerValue = initialValue;
            node[attrName] = map(innerValue);
            

            // why does reading/writing to/fron attr.value directly not work here?
            return {
                /**
                 * @returns {import('./types.ts').Primitive | null}
                 */
                get() {
                    return innerValue;
                },
                /**
                * @param {import('./types.ts').Primitive | null | Promise<import('./types.ts').Primitive | null>} value 
                */
                set(value) {
                    if (typeof value?.then === 'function') {
                        value.then(v => {
                            innerValue = v;
                            node[attrName] = map(v);
                        });
                    } else {
                        innerValue = value;
                        node[attrName] = map(value);
                    }
                }
            };
        },
    };
}