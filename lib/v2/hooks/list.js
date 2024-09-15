import { push } from 'qunit';
import { randomId, getAttributeUnder } from '../util.js';

/**
 * 
 * @param {Node} newNode 
 * @param {Node} afterNode 
 */
function insertAfter(newNode, afterNode) {
    return afterNode.parentNode.insertBefore(newNode, afterNode.nextSibling);
}


/**
 * @type {import('../types.ts').list}
 */
export function list(id, mapperOrDataA, mapperOrDataB) {
    const map =
        typeof mapperOrDataA === 'function' ? mapperOrDataA :
        typeof mapperOrDataB === 'function' ? mapperOrDataB :
        item => html`<div>${item}</div>`
    ;

    const data =
        Array.isArray(mapperOrDataA) ? mapperOrDataA :
        Array.isArray(mapperOrDataB) ? mapperOrDataB :
        []
    ;
    
    const sentinelId = randomId();

    return {
        id,
        toString: () => `<liststart data-id=${sentinelId} style='display: none;'></liststart>`,
        bless: (context) => {
            /**
             * @type {Map<object, Node>}
             */
            const nodes = new Map();
            const items = [];

            const listStart = context.container.querySelector(`[data-id="${sentinelId}"]`);

            // do we want to use our sneaky "reflect" library here instead?
            const overrides = {
                push(...newItems) {
                    for (const item of newItems) {
                        items.push(item);
                        const node = map(item);
                        nodes.set(item, node);
                        insertAfter(node, listStart);
                    }
                    return items.length;
                }
            };

            const proxy = new Proxy(items, {
                get(target, propName) {
                    return overrides[propName] || target[propName];
                },
                set(target, propName, value) {
                    // if propName is a number, we need to map it.
                },
                deleteProperty(target, propName) {
                    // if propName is a number, need to handle deletion
                }
            });

            return {
                get() {
                    return proxy;
                },
                set(newItems) {
                    for (const item of items) {
                        const node = nodes.get(item);
                        if (node && node.parentNode) node.parentNode.removeChild(node);
                        nodes.delete(item)
                    }
                    items.splice(0);
                    this.push(...newItems);
                },
            };
        },
    };
}
