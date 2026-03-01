import { __dataType, __renderedType } from "../internals.js";
import { isPromise } from "../util.js";
export function id(id, type) {
    return {
        id,
        toString: () => `data-id="${id}"`,
        bless: context => {
            let node = context
                .container
                .querySelector(`[data-id="${id}"]`);
            return {
                get() {
                    return node;
                },
                set(value) {
                    function setNode(newValue) {
                        const replacement = newValue || document.createTextNode('');
                        try {
                            node?.parentNode?.replaceChild(replacement, node);
                            node = replacement;
                        }
                        catch (error) {
                            console.log("Skipping replacement of node with non-node new value.", { node, newValue });
                        }
                    }
                    if (isPromise(value)) {
                        value.then(v => setNode(v));
                    }
                    else {
                        setNode(value);
                    }
                }
            };
        },
        [__dataType]: {},
        [__renderedType]: {},
    };
}
