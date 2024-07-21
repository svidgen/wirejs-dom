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
                 * @param {Element | null} newNode 
                 */
                set(newNode) {
                    const replacement = newNode || document.createElement('span')
                    node?.parentNode?.replaceChild(replacement, node)
                    node = replacement;
                }
            }
        }
    };
}