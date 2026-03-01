import { __dataType, __renderedType } from '../internals.js';
import { randomId, isPromise, findCommentNode } from '../util.js';
export function text(id, ...args) {
    const [mapperOrDataA, mapperOrDataB] = args;
    const map = typeof mapperOrDataA === 'function' ? mapperOrDataA :
        typeof mapperOrDataB === 'function' ? mapperOrDataB :
            (item) => item ?? '';
    const initialValue = (typeof mapperOrDataA === 'function' ? mapperOrDataB : mapperOrDataA);
    const sentinelId = randomId();
    return {
        id,
        toString: () => `<!-- ${sentinelId} -->`,
        bless: (context) => {
            let innerValue = initialValue;
            const node = document.createTextNode(map(innerValue));
            const placeHolder = findCommentNode(context.container, sentinelId);
            placeHolder.parentNode?.replaceChild(node, placeHolder);
            return {
                get() {
                    return innerValue;
                },
                set(value) {
                    if (isPromise(value)) {
                        value.then(v => {
                            innerValue = v;
                            node.nodeValue = map(v);
                        });
                    }
                    else {
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
