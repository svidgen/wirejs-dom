import { randomId, getAttributeUnder } from '../util.js';
import { addWatcherHooks } from './dom-events.js';

/**
 * @type {import('../types').html} 
 */
export function html(
    raw,
    ...builders
) {
    const container = document.createElement("div");

    // TODO: create a function hook and replace inline functions with those.
    // then, the `builder?.f` check below can go away, as the swap will just
    // act like a "normal" attribute replacement without the `id` accessor.
    const adjustedBuilders = builders.map(b => {
        if (typeof b === 'function') {
            const id = randomId();
            return { id, toString() { return id; }, f: b };
        } else {
            return b;
        }
    });

    const markup = String.raw({ raw }, ...adjustedBuilders).trim();
    container.innerHTML = markup;
    const node = container.firstElementChild;
    node.data = {};

    for (const builder of adjustedBuilders) {
        let accessor;

        if (typeof builder?.f === 'function') {
            // replace builder "text" with the actual builder function,
            // which will include the closure.
            const fAttr = getAttributeUnder(node, builder.id);
            const e = fAttr.ownerElement
            e.removeAttribute(fAttr.name);
            e[fAttr.name] = builder.f;
        }

        if (typeof builder?.bless === "function") {
            accessor = builder.bless({ container, data: node.data });
        }

        // NOTE: behavior for adding accessors of varying types (e.g., list + text) is
        // explicitly not defined and not accounted for.
        if (builder?.id) {
            appendAccessor(node, builder.id, accessor);
        }
    }

    // need some way to have caller set this and use it to refer to the child `data` properties.
    const id = randomId();

    // `bless` is used if this node is inserted into another `html` document.
    node.bless = context => {
        const foundNode = context.container.querySelector(`[data-id="${id}"]`);
        foundNode && foundNode.parentNode?.replaceChild(node, foundNode);
    };

    // `toString` is used if this node is inserted into another `html` document.
    // We need to add a placeholder which will be replaced when we "bless" parent.
    node.toString = () => `<placeholder data-id="${id}"></placeholder>`;

    addWatcherHooks(node);
    return node;
}


/**
 * @type {WeakMap<object, Record<string, {get: () => any, set(v: any) => void}[]>}
 */
const knownAccessors = new WeakMap();

/**
 * 
 * @param {{data: object}} node 
 */
function appendAccessor(node, propName, accessor) {
    if (!knownAccessors.has(node.data)) {
        knownAccessors.set(node.data, {});
    }

    const nodeAccessor = knownAccessors.get(node.data);
    if (!nodeAccessor[propName]) {
        const nodePropAccessors = []
        nodeAccessor[propName] = nodePropAccessors;
        Object.defineProperty(
            node.data,
            propName,
            {
                get() {
                    // just defer to the first one as the record of truth.
                    return nodePropAccessors[0]?.get();
                },
                set(v) {
                    // updates, on the other hand, must be broadcast to each.
                    for (const a of nodePropAccessors) {
                        a.set(v);
                    }
                }
            }
        );
    }

    nodeAccessor[propName].push(accessor);
}