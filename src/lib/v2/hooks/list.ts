import { __dataType, __renderedType } from '../internals.js';
import { ElementBuilder } from '../types.js';
import { html } from '../components/html.js';
import { randomId, isPromise } from '../util.js';

function insertAfter(newNode: Node, afterNode: Node) {
	return afterNode.parentNode?.insertBefore(newNode, afterNode.nextSibling);
}

export function list<ID extends string, InputType = string>(
	id: ID,
	...args:
		| [ map?: (item: InputType) => any, data?: InputType[] ]
		| [ data?: InputType[], map?: (item: InputType) => any ]
): ElementBuilder<ID, InputType[]> {
	const [mapperOrDataA, mapperOrDataB] = args;
	const map =
		typeof mapperOrDataA === 'function' ? mapperOrDataA :
		typeof mapperOrDataB === 'function' ? mapperOrDataB :
		(item: unknown) => html`<div>${item}</div>`
	;

	const initialItems =
		Array.isArray(mapperOrDataA) ? mapperOrDataA :
		Array.isArray(mapperOrDataB) ? mapperOrDataB :
		[]
	;

	const sentinelId = randomId();

	return {
		id,
		toString: () => `<placeholder data-id=${sentinelId} style='display: none;'></placeholder>`,
		bless: (context) => {
			const nodes: Node[] = [];
			const items: InputType[] = [];

			// replace placeholder with empty start/end marker nodes for easy
			// management with insertAfter/insertBefore operations.
			const placeholder = context.container.querySelector(`[data-id="${sentinelId}"]`)!;
			const startMarker = document.createTextNode('');
			insertAfter(startMarker, placeholder);
			const endMarker = document.createTextNode('');
			insertAfter(endMarker, startMarker);
			placeholder.parentNode?.removeChild(placeholder);

			/**
			 * Removes the node from the DOM.
			 */
			function removeNode(node: Node) {
				return node?.parentNode?.removeChild(node);
			}

			/**
			 * Clears and re-inserts all `nodes`.
			 */
			function refresh() {
				while (startMarker.nextSibling !== endMarker) {
					startMarker.parentNode?.removeChild(startMarker.nextSibling!);
				}

				let tail: Node = startMarker;
				for (const node of nodes) {
					if (tail) {
						insertAfter(node, tail);
						tail = node;
					}
				}
			}

			const overrides = {
				push(...newItems: InputType[]) {
					for (const item of newItems) {
						const node = map(item);
						endMarker.parentNode?.insertBefore(node, endMarker);
						items.push(item);
						nodes.push(node);
					}
					return items.length;
				},

				pop() {
					const poppedItem = items.pop();
					const poppedNode = nodes.pop();
					poppedNode && removeNode(poppedNode);
					return poppedItem;
				},

				shift() {
					const removedItem = items.shift();
					const removedNode = nodes.shift();
					removedNode && removeNode(removedNode);
					return removedItem;
				},

				unshift(...newItems: InputType[]) {
					const newNodes: Node[] = [];
					for (const item of [...newItems].reverse()) {
						const node = map(item);
						newNodes.push(node);
						insertAfter(node, startMarker);
					}
					nodes.unshift(...newNodes);
					return items.unshift(...newItems);
				},

				splice(start: number, deleteCount: number, ...newItems: InputType[]) {
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
					nodes.splice(start, correctedDeleteCount, ...newNodes);
					refresh();
					return removedItems;
				},

				sort(comparer: (a: InputType, b: InputType) => number) {
					//
					// AFAIK, there is no "organic" way to track sorting. long term: we'll create
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
					refresh();
					return proxy;
				},

				reverse(): InputType[] {
					nodes.reverse();
					refresh();
					items.reverse();
					return proxy;
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
				set(target, propName: string, value, receiver) {
					if (Number.isNaN(parseInt(propName))) {
						Reflect.set(target, propName, value, receiver);
					} else {
						overrides.splice(parseInt(propName), 1, value);
					}
					return true;
				},
				deleteProperty(target, propName: string) {
					if (Number.isNaN(parseInt(propName))) {
						Reflect.deleteProperty(target, propName);
					} else {
						overrides.splice(parseInt(propName), 1);
					}
					return true;
				}
			});

			proxy.push(...initialItems)

			return {
				get() {
					return proxy;
				},
				set(newItems: InputType[]) {
					proxy.splice(0);

					if (isPromise<InputType[]>(newItems)) {
						newItems.then(v => proxy.push(...v));
					} else {
						proxy.push(...newItems);
					}
				},
			};
		},
		[__dataType]: {} as InputType[],
		[__renderedType]: {} as InputType[]
	};
}
