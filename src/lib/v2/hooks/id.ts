import { __dataType, __renderedType } from "../internals.js";
import { ElementBuilder } from "../types.js";
import { isPromise } from "../util.js";

export function id<ID extends string, T extends Node>(
	id: ID,
	type?: new () => T
): ElementBuilder<ID, T> {
	return {
		id,
		toString: () => `data-id="${id}"`,
		bless: context => {
			let node = context
				.container
				.querySelector(`[data-id="${id}"]`)! as unknown as T;
			return {
				get(): T {
					return node;
				},
				set(value: T | Promise<T>) {
					function setNode(newValue: T) {
						const replacement = newValue || document.createTextNode('')
						try {
							node?.parentNode?.replaceChild(replacement, node)
							node = replacement;
						} catch (error) {
							console.log("Skipping replacement of node with non-node new value.", { node, newValue });
						}
					}

					if (isPromise<Node>(value)) {
						value.then(v => setNode(v));
					} else {
						setNode(value);
					}
				}
			}
		},
		[__dataType]: {} as T,
		[__renderedType]: {} as T,
	};
}