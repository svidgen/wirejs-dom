import { __dataType, __renderedType } from '../internals.js';
import { ElementBuilder } from '../types.js';
import { randomId, isPromise, findCommentNode } from '../util.js';

export function text<ID extends string>(
	id: ID,
	...args:
		| [ map?: (item: string) => string, value?: string | Promise<string> ]
		| [ value?: string | Promise<string>, map?: (item: string) => string ]
): ElementBuilder<ID, string> {
	const [mapperOrDataA, mapperOrDataB] = args;

	const map =
		typeof mapperOrDataA === 'function' ? mapperOrDataA :
		typeof mapperOrDataB === 'function' ? mapperOrDataB :
		(item: string) => item ?? ''
	;

	const initialValue =
		(typeof mapperOrDataA === 'function' ? mapperOrDataB : mapperOrDataA) as
			string | Promise<string> | undefined
	;

	const sentinelId = randomId();

	return {
		id,
		toString: () => `<!-- ${sentinelId} -->`,
		bless: (context) => {
			let innerValue: string | undefined;

			const node = document.createTextNode('');
			const placeHolder = findCommentNode(context.container, sentinelId)!;
			placeHolder.parentNode?.replaceChild(node, placeHolder);

			if (isPromise<string>(initialValue)) {
				initialValue.then(v => {
					innerValue = v;
					node.nodeValue = map(v);
				});
			} else {
				innerValue = initialValue;
				node.nodeValue = map(innerValue as string);
			}

			return {
				get(): string {
					return innerValue!;
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
