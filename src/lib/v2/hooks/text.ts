import { __dataType, __renderedType } from '../internals.js';
import { ElementBuilder } from '../types.js';
import { randomId, isPromise } from '../util.js';

export function text<ID extends string>(
	id: ID,
	...args:
		| [ map?: (item: string) => string, value?: string ]
		| [ value?: string, map?: (item: string) => string ]
): ElementBuilder<ID, string> {
	const [mapperOrDataA, mapperOrDataB] = args;

	const map =
		typeof mapperOrDataA === 'function' ? mapperOrDataA :
		typeof mapperOrDataB === 'function' ? mapperOrDataB :
		(item: string) => item ?? ''
	;

	const initialValue =
		(typeof mapperOrDataA === 'function' ? mapperOrDataB : mapperOrDataA) as string
	;

	const sentinelId = randomId();

	return {
		id,
		toString: () => `<textph data-id=${sentinelId}>${initialValue}</textph>`,
		bless: (context) => {
			let innerValue = initialValue;

			const node = document.createTextNode(map(innerValue));
			const placeHolder = context.container.querySelector(`[data-id="${sentinelId}"]`)!;
			placeHolder.parentNode?.replaceChild(node, placeHolder);

			return {
				get(): string {
					return innerValue;
				},
				set(value: string | Promise<string>) {
					if (isPromise<string>(value)) {
						value.then(v => {
							innerValue = v;
							node.nodeValue = map(v);
						});
					} else {
						innerValue = value;
						node.nodeValue = map(value);
					}
				}
			};
		},
		[__dataType]: '',
		[__renderedType]: '',
	};
}
