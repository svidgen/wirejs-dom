import { randomId } from '../util.js';

/**
 * @type {import('../types.ts').textElementBuilder}
 */
export function text(id, mapperOrDataA, mapperOrDataB) {
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
        toString: () => `<textph data-id=${sentinelId}>${initialValue}</textph>`,
        bless: (context) => {
            let innerValue = initialValue;

            const node = document.createTextNode(map(innerValue));
            const placeHolder = context.container.querySelector(`[data-id="${sentinelId}"]`);
            placeHolder.parentNode.replaceChild(node, placeHolder);

            return {
                /**
                 * @returns {string}
                 */
                get() {
                    return innerValue;
                },
                /**
                * @param {string | Promise<string>} value 
                */
                set(value) {
                    if (typeof value.then === 'function') {
                        value.then(v => {
                            innerValue = v;
                            node.nodeValue = map(v);
                        });
                    } else {
                        innerValue = value;
                        node.nodeValue = map(value);
                    }
                }
            };
        },
    };
}
