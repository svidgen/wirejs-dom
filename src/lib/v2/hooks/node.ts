import { __dataType, __renderedType } from '../internals.js';
import { ElementBuilder } from '../types.js';
import { randomId, isPromise } from '../util.js';

export function node<
	ID extends string,
	ReturnType extends HTMLElement,
	InputType = string,
>(
	id: ID,
	...args:
		| [ map?: (item?: InputType) => ReturnType, value?: InputType ]
		| [ value: InputType, map?: (item?: InputType) => ReturnType ]
): ElementBuilder<ID, InputType, ReturnType> {
	const [mapperOrDataA, mapperOrDataB] = args;

	const map = (
		typeof mapperOrDataA === 'function' ? mapperOrDataA :
		typeof mapperOrDataB === 'function' ? mapperOrDataB :
		(item?: InputType) => (
			item instanceof Element
			|| item instanceof Node
		) ? item : document.createTextNode(item ? String(item) : '')
	) as (
		(item?: InputType) => ReturnType
	)
	;

	const initialValue =
		(typeof mapperOrDataA === 'function' ? mapperOrDataB : mapperOrDataA) as InputType
	;

	const sentinelId = randomId();

	return {
		id,
		toString: () => `<ph data-id=${sentinelId}></ph>`,
		bless: (context) => {
			let innerValue: InputType | undefined = initialValue;

			let node = map(innerValue);
			const placeHolder = context.container.querySelector(`[data-id="${sentinelId}"]`)!;
			placeHolder.parentNode?.replaceChild(node, placeHolder);

			function setValue(value?: InputType) {
				const newNode = map(value);
				node.parentNode?.replaceChild(newNode, node);
				node = newNode;
			}

			return {
				/**
				 * @returns {InputType}
				 */
				get() {
					return innerValue;
				},
				set(value?: InputType | Promise<InputType | undefined>) {
					if (isPromise<InputType | undefined>(value)) {
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
		[__dataType]: {} as InputType,
		[__renderedType]: {} as ReturnType,
	};
}
