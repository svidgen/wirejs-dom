import { randomId } from '../util.js';

/**
 * @type {import('../types.ts').node}
 */
export function node(id, mapperOrDataA, mapperOrDataB) {
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
		toString: () => `<ph data-id=${sentinelId}></ph>`,
		bless: (context) => {
			let innerValue = initialValue;

			const node = map(innerValue);
			const placeHolder = context.container.querySelector(`[data-id="${sentinelId}"]`);
			placeHolder.parentNode.replaceChild(node, placeHolder);

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
							node.parentNode.replaceChild(map(v), node);
						});
					} else {
						innerValue = value;
						node.parentNode.replaceChild(map(value), node);
					}
				}
			};
		},
	};
}
