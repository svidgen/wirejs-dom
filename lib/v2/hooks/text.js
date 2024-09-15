import { randomId } from '../util.js';

/**
 * @type {import('../types.ts').textElementBuilder}
 */
export function text(id, body = '') {
    const sentinelId = randomId();
    return {
        id,
        toString: () => `<textplaceholder data-id=${sentinelId}>${body}</textplaceholder>`,
        bless: (context) => {
            const node = document.createTextNode(body);
            const placeHolder = context.container.querySelector(`[data-id="${sentinelId}"]`);
            placeHolder.parentNode.replaceChild(node, placeHolder);
            return {
                /**
                 * @returns {string}
                 */
                get() {
                    return node.nodeValue;
                },
                /**
                * @param {string} value 
                */
                set(value) {
                    node.nodeValue = value;
                }
            }
        },
    };
}
