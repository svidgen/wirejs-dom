import { html } from '../components/html.js';
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
             * @type {Node[]}
             */
            const nodes = [];

            /**
             * @type {InputType[]}
             */
            const items = [];

            const listStart = context.container.querySelector(`[data-id="${sentinelId}"]`);
            const range = document.createRange();
            range.setStartAfter(listStart);
            listStart.parentNode.removeChild(listStart);

            // /** @returns {Node} */
            // function makeNodeFor(dataItem) {
            //     const node = map(dataItem);
            //     nodes.set(dataItem, node);
            //     return node;
            // }

            // /**
            //  * 
            //  * @param {InputType} dataItem 
            //  * @returns 
            //  */
            // function removeNodeFor(dataItem) {
            //     /** @type {Node | undefined} */
            //     const node = nodes[dataItem];
            //     return node?.parentNode?.removeChild(node);
            // };

            /**
             * Removes the node from the DOM.
             * 
             * @param {Node} node
             */
            function removeNode(node) {
                return node?.parentNode?.removeChild(node);
            }

            /**
             * Clears the `range` and re-inserts all of the `nodes`.
             * 
             * @param {Node[]} nodes 
             */
            function refreshRange() {
                range.deleteContents();
                let tail = null;
                for (const node of nodes) {
                    if (tail) {
                        insertAfter(node, tail);
                        range.setEndAfter(node);
                        tail = node;
                    } else {
                        range.insertNode(node);
                        tail = node;
                    }
                }
            }

            const overrides = {
                push(...newItems) {
                    for (const item of newItems) {
                        const lastItem = items[items.length - 1];
                        const lastNode = nodes[nodes.length - 1];
                        const node = map(item);
                        if (lastNode) {
                            insertAfter(node, lastNode);
                            range.setEndAfter(node);
                        } else {
                            range.insertNode(node);
                        }
                        items.push(item);
                        nodes.push(node);
                    }
                    return items.length;
                },

                pop() {
                    const poppedItem = items.pop();
                    const poppedNode = nodes.pop();
                    removeNode(poppedNode);
                    return poppedItem;
                },

                shift() {
                    const removedItem = items.shift();
                    const removedNode = nodes.shift();
                    removeNode(removedNode);
                    return removedItem;
                },

                /**
                 * @param  {...any} items 
                 */
                unshift(...newItems) {
                    /** @type {Node[]} */
                    const newNodes = [];
                    for (const item of [...newItems].reverse()) {
                        const node = map(item);
                        newNodes.push(item);
                        range.insertNode(node);
                    }
                    nodes.unshift(...newNodes);
                    return items.unshift(...newItems);
                },

				/**
				 * @param {number} start
				 * @param {number} deleteCount
				 * @param {...object} items 
				 */
				splice(start, deleteCount, ...newItems) {
                    //
                    // simple, naive implementation for now. there are a lot of cases to
                    // account for otherwise, especially since callers could splice into
                    // gaps in the array. in those cases, we'd need to scan for the first
                    // non-null node forwards to obtain a reference point. but, splice can
                    // also target past the end of the array, in which case it behaves like
                    // a push... all edges we can account for. but, best to start with the
                    // simplest solution to test against:
                    //
                    // 1. map the data into a set of new nodes
                    // 2. splice both the items and nodes collections
                    // 3. recreate the DOM state within the range
                    // 4. profit.
                    //

                    const correctedDeleteCount = typeof deleteCount === 'number'
                        ? deleteCount : items.length;

                    const newNodes = (newItems || []).map(item => map(item));
					const removedItems = items.splice(start, correctedDeleteCount, ...newItems);
                    console.log({removedItems});
                    nodes.splice(start, correctedDeleteCount, ...newNodes);
                    refreshRange();
                    return removedItems;
				},

                /**
                 * 
                 * @param {(object, object) => number} comparer 
                 */
                sort(comparer) {
                    //
                    // AFAIK, there is not "organic" way to track sorting. long term: we'll create
                    // an array of the indexes of the `items` collection. we can sort that
                    // array using a proxy for the comparer to track which indexes end up where.
                    // we can then use that collection to sort nodes and re-insert them.
                    //
                    // for now, we'll do the easy thing. we'll just sort the items and remap
                    // the nodes.
                    // 
                    // TODO: we need a callback/event mechanism to notify nodes when they're
                    // being removed and/or destroyed, so they can perform cleanup.
                    // 

                    items.sort(comparer);
                    nodes.splice(0);
                    nodes.push(...items.map(item => map(item)));
                    refreshRange();
                    return items;
                },

                reverse() {
                    nodes.reverse();
                    refreshRange();
                    return items.reverse();
                }
            };

            const proxy = new Proxy(items, {
                get(target, propName, receiver) {
                    if (overrides.hasOwnProperty(propName)) {
                        return overrides[propName];
                    } else {
                        return Reflect.get(target, propName, receiver);
                    }
                },
                set(target, propName, value, receiver) {
                    console.log('set', {target, propName, value, receiver});
					if (Number.isNaN(parseInt(propName))) {
                        Reflect.set(target, propName, value, receiver);
					} else {
						return overrides.splice(parseInt(propName), 1, value);
					}
                },
                deleteProperty(target, propName) {
                    if (Number.isNaN(parseInt(propName))) {
                        Reflect.deleteProperty(target, propName);
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
                    proxy.splice(0);
                    proxy.push(...newItems);
                },
            };
        },
    };
}
