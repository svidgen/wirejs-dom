import { randomId, getAttributeUnder } from '../util.js';

/**
 * @type {import('../types').html} 
 */
export function html(
    raw,
    ...builders
) {
    const container = document.createElement("div");

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
            accessor = builder.bless({ container });
        }

        if (builder?.id) {
            // default innerHTML accessor in this case?
            // is there anything more intelligent we can do?
            Object.defineProperty(
                node.data,
                builder.id,
                accessor || {},
            );
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

    return node;
}