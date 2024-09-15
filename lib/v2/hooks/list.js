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

    const initialItems =
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

            /** @returns {Node} */
            function makeNodeFor(dataItem) {
                const node = map(dataItem);
                nodes.set(dataItem, node);
                return node;
            }

            function removeNodeFor(dataItem) {
                /** @type {Node | undefined} */
                const node = nodes[dataItem];
                return node?.parentNode?.removeChild(node);
            };

            // do we want to use our sneaky "reflect" library here instead?
            const overrides = {
                push(...newItems) {
                    for (const item of newItems) {
                        const last = items[items.length - 1];
                        const node = makeNodeFor(item);
                        if (last) {
                            insertAfter(node, nodes[last]);
                        } else {
                            insertAfter(node, listStart);
                        }
                        items.push(item);
                    }
                    return items.length;
                },

                pop() {
                    const popped = items.pop();
                    removeNodeFor(popped);
                    return popped;
                },

                shift() {
                    const removed = items.shift();
                    removeNodeFor(removed);
                    return removed;
                },

                /**
                 * @param  {...any} items 
                 */
                unshift(...items) {
                    for (const item of [...items].reverse()) {
                        insertAfter(makeNodeFor(item), listStart);
                    }
                    return items.unshift(...items);
                },

				/**
				 * @param {number} start
				 * @param {number} deleteCount
				 * @param {...object} items 
				 */
				splice(start, deleteCount, ...items) {
                    //
                    // strategic algorithm
                    // 
                    // 1. get the node associated with the item located at `start`
                    // 2. repeatedly insert `...items` at that position
                    //   2.a. if node exists, before that node.
                    //   2.a. else, just push. assume entrypoint is at *end* or array is empty
                    // 3. splice the deletion range out of the data
                    // 4. iteratively remove each of those nodes from the DOM and map
                    // 
                    // perhaps not the most efficient, but lets us operate both the
                    // array and DOM a little more "surgically", which is theoretically
                    // faster than re-creating, re-rendering, and re-hydrating everything.
                    // 

                    // 1
                    /** @type {Node} */
                    const entryPoint = nodes[items[0]];

                    // 2
                    for (const item of items) {
                        const node = makeNodeFor(item);
                        if (entryPoint) {
                            // 2.a.
                            entryPoint.parentNode.insertBefore(node, entryPoint);
                        } else {
                            // 2.b.
                            this.push(node);
                        }
                    }

                    // 3
					const removed = items.splice(start, deleteCount, ...items);

                    // 4
                    for (const item of removed) {
                        removeNodeFor(item);
                    }

                    return removed;
				},

                /**
                 * 
                 * @param {(object, object) => number} comparer 
                 */
                sort(comparer) {
                    items.sort(comparer);
                    let afterNode = entryPoint;
                    for (const item of items) {
                        const node = nodes[item];
                        insertAfter(node, afterNode);
                        afterNode = node;
                    }
                    return items;
                },

                reverse() {
                    for (const item of items) {
                        const node = nodes[item];
                        insertAfter(node, entryPoint);
                    }
                    return items.reverse();
                }
            };

            const proxy = new Proxy(items, {
                get(target, propName) {
                    return overrides[propName] || target[propName];
                },
                set(target, propName, value) {
					if (Number.isNaN(parseInt(propName))) {
						target[propName] = value;
					} else {
						overrides.splice(propName, 1, value);
					}
                },
                deleteProperty(target, propName) {
                    if (Number.isNaN(parseInt(propName))) {
                        delete target[propName];
                    } else {
                        overrides.splice(propName, 1);
                    }
                }
            });

            proxy.push(...initialItems)

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
