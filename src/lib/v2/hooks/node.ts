import { __dataType, __renderedType } from '../internals.js';
import { ElementBuilder } from '../types.js';
import { randomId, isPromise, findCommentNode } from '../util.js';

export function node<
	ID extends string,
	ReturnType extends HTMLElement,
	InputType = string,
>(
	id: ID,
	...args:
		| [ map?: (item?: InputType) => ReturnType, value?: InputType | Promise<InputType> ]
		| [ value: InputType | Promise<InputType>, map?: (item?: InputType) => ReturnType ]
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
		(typeof mapperOrDataA === 'function' ? mapperOrDataB : mapperOrDataA) as
			InputType | Promise<InputType> | undefined
	;

	const sentinelId = randomId();

	return {
		id,
		toString: () => `<!-- ${sentinelId} -->`,
		bless: (context) => {
			let innerValue: InputType | undefined;

			let node = map(isPromise<InputType>(initialValue) ? undefined : initialValue as InputType);
			const placeHolder = findCommentNode(context.container, sentinelId)!;
			placeHolder.parentNode?.replaceChild(node, placeHolder);

			function setValue(value?: InputType) {
				const newNode = map(value);
				node.parentNode?.replaceChild(newNode, node);
				node = newNode;
			}

			if (isPromise<InputType>(initialValue)) {
				initialValue.then(v => {
					innerValue = v;
					setValue(v);
				});
			} else {
				innerValue = initialValue;
			}

			return {
				get(): InputType {
					return innerValue!;
				},
				set(value: InputType | Promise<InputType>) {
					if (isPromise<InputType>(value)) {
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
