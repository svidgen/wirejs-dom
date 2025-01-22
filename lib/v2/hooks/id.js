/**
 * @type {import('../types.ts').id}
 */
export function id(id) {
	return {
		id,
		toString: () => `data-id="${id}"`,
		bless: context => {
			let node = context.container.querySelector(`[data-id="${id}"]`);
			return {
				/**
				 * @returns {Element | null}
				 */
				get() {
					return node;
				},
				/**
				 * @param {Element | null | Promise<Element | null>} newNode 
				 */
				set(value) {
					function setNode(newNode) {
						const replacement = newNode || document.createTextNode('')
						try {
							node?.parentNode?.replaceChild(replacement, node)
							node = replacement;
						} catch (error) {
							console.error("Cannot replace node with non-node.", newNode);
						}
					}

					if (typeof value?.then === 'function') {
						value.then(v => setNode(v));
					} else {
						setNode(value);
					}
				}
			}
		}
	};
}
