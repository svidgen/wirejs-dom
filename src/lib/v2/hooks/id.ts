import { __dataType, __renderedType } from "../internals.js";
import { ElementBuilder } from "../types.js";
import { isPromise } from "../util.js";

export function id<ID extends string>(id: ID): ElementBuilder<ID, Node> {
	return {
		id,
		toString: () => `data-id="${id}"`,
		bless: context => {
			let node: Node = context.container.querySelector(`[data-id="${id}"]`)!;
			return {
				get(): Node {
					return node;
				},
				set(value: Node | Promise<Node>) {
					function setNode(newValue: Node) {
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
		[__dataType]: {} as Node,
		[__renderedType]: {} as Node,
	};
}