import { randomId, getAttributeUnder } from '../util.js';

/**
 * @type {import('../types.ts').attribute}
 */
export function attribute(id, mapperOrDataA, mapperOrDataB) {
	const map =
		typeof mapperOrDataA === 'function' ? mapperOrDataA :
		typeof mapperOrDataB === 'function' ? mapperOrDataB :
		item => item
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

			// clean the temporary ID out of the node's outerHTML.
			attr.value = '';

			let innerValue = initialValue;
			node[attrName] = map(innerValue);

			function doSet(value) {
				innerValue = value;
				node[attrName] = map(value);
			}

			//
			// special case for inputs. because we allow mapping of values on set(),
			// and because the user is a source of input, we need special handling to
			// ensure that user input is captured. and, my current expectation is that
			// mapping apply to user-provided input, and therefore that the mapped
			// value is actually the *intended* value for inputs.
			//
			// E.g., if your mapper is: `v => v.toUpperCase()`, your intention is
			// probably that the letters are capitalized as the user types them. and
			// your intention is *probably* that this capitalized value is the value
			// you want to consume later when you get() the value.
			//
			if (
				node.tagName === 'INPUT'
				&& attrName === 'value'
				&& typeof node.oninput !== 'function'
			) {
				node.oninput = () => {
					context.data[id] = map(node[attrName]);
				};
			}

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
						value.then(v => doSet(v) );
					} else {
						doSet(value);
					}
				}
			};
		},
	};
}
