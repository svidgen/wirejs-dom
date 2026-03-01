import { __dataType, __renderedType } from '../internals.js';
import { randomId, isPromise, findCommentNode } from '../util.js';
export function node(id, ...args) {
    const [mapperOrDataA, mapperOrDataB] = args;
    const map = (typeof mapperOrDataA === 'function' ? mapperOrDataA :
        typeof mapperOrDataB === 'function' ? mapperOrDataB :
            (item) => (item instanceof Element
                || item instanceof Node) ? item : document.createTextNode(item ? String(item) : ''));
    const initialValue = (typeof mapperOrDataA === 'function' ? mapperOrDataB : mapperOrDataA);
    const sentinelId = randomId();
    return {
        id,
        toString: () => `<!-- ${sentinelId} -->`,
        bless: (context) => {
            let innerValue = initialValue;
            let node = map(innerValue);
            const placeHolder = findCommentNode(context.container, sentinelId);
            placeHolder.parentNode?.replaceChild(node, placeHolder);
            function setValue(value) {
                const newNode = map(value);
                node.parentNode?.replaceChild(newNode, node);
                node = newNode;
            }
            return {
                get() {
                    return innerValue;
                },
                set(value) {
                    if (isPromise(value)) {
                        value.then(v => {
                            innerValue = v;
                            setValue(v);
                        });
                    }
                    else {
                        innerValue = value;
                        setValue(value);
                    }
                }
            };
        },
        [__dataType]: {},
        [__renderedType]: {},
    };
}
