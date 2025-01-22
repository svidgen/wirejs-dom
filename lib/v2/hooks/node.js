import { randomId } from '../util.js';

/**
 * @type {import('../types.ts').node}
 */
export function node(id, mapperOrDataA, mapperOrDataB) {
	const map =
		typeof mapperOrDataA === 'function' ? mapperOrDataA :
		typeof mapperOrDataB === 'function' ? mapperOrDataB :
		item => (
			item instanceof Element
			|| item instanceof Node
		) ? item : document.createTextNode(item ?? '')
	;

	const initialValue =
		typeof mapperOrDataA === 'function' ? mapperOrDataB : mapperOrDataA
	;

	const sentinelId = randomId();

	return {
		id,
		toString: () => `<ph data-id=${sentinelId}></ph>`,
		bless: (context) => {
			let innerValue = initialValue;

			let node = map(innerValue);
			const placeHolder = context.container.querySelector(`[data-id="${sentinelId}"]`);
			placeHolder.parentNode.replaceChild(node, placeHolder);

			function setValue(value) {
				const newNode = map(value);
				node.parentNode.replaceChild(newNode, node);
				node = newNode;
			}

			return {
				/**
				 * @returns {InputType}
				 */
				get() {
					return innerValue;
				},
				/**
				 * @param {InputType | Promise<InputType>} value 
				 */
				set(value) {
					if (typeof value.then === 'function') {
						value.then(v => {
							innerValue = v;
							setValue(v);
						});
					} else {
						innerValue = value;
						setValue(value);
					}
				}
			};
		},
	};
}
