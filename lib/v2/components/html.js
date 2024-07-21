import { randomId } from '../util.js';

/**
 * @type {import('../types').html} 
 */
export function html(
    raw,
    ...builders
) {
    const container = document.createElement("div");
    const markup = String.raw({ raw }, ...builders).trim();
    container.innerHTML = markup;
    const node = container.firstElementChild;
    node.data = {};

    for (const builder of builders) {
        let accessor;

        if (typeof builder.bless === "function") {
            accessor = builder.bless({ container });
        }

        if (builder.id) {
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