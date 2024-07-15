/**
 * @type {import('./types').html} 
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

/**
 * @type {import('./types.ts').id}
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

/**
 * @type {import('./types.ts').text}
 */
export function span(
    id,
    body = '',
) {
    return {
        id,
        toString: () => `<span data-id="${id}">${body}</span>`,
        bless: context => {
            const node = context.container.querySelector(`[data-id="${id}"]`);
            return {
                /**
                 * @returns {Element | null}
                 */
                get() {
                    return node?.innerHTML;
                },
                /**
               * @param {string | null} newNode 
               */
                set(newText) {
                    node && (node.innerHTML = newText || '');
                }
            }
        }
    };
}

function randomId() {
    return `${new Date().getTime()}_${Math.floor(Math.random() * 1000000)}`;
}

/**
 * 
 * @param {Element} node 
 * @param {string} id 
 * @returns 
 */
function matchingAttribute(node, id) {
    for (const attribute of node.attributes) {
        if (attribute.value === id) return attribute;
    }
    return null;
}

/**
 * @param {Element} root 
 * @param {string} id 
 * @returns {Attr}
 */
function getAttributeUnder(root, id) {
    /**
     * @type {Element[]}
     */
    const q = [root];

    // theoretically no need for visit tracking,
    // since this is a tree; not a graph.
    while (q.length > 0) {
        const node = q.shift();
        if (!node) return;

        const attribute = matchingAttribute(node, id);
        if (attribute) {
            return attribute;
        }

        for (const child of node.children) {
            q.push(child);
        }
    }
}

/**
 * @param {Element} root 
 * @param {string} id 
 * @param {any} value 
 */
function setAttributeUnder(root, id, value) {
    const attribute = getAttributeUnder(root, id);
    if (attribute) {
        attribute.value = value;
        return attribute;
    }
}

/**
 * @type {import('./types.ts').handle}
 */
export function handle(handler) {
    const id = randomId();
    return {
        toString: () => id,
        bless: (context) => {
            setAttributeUnder(context.container, id, handler);
        },
    };
}

/**
 * @type {import('./types.ts').attribute}
 */
export function attribute(id, value) {
    const sentinelId = randomId();
    return {
        id,
        toString: () => sentinelId,
        bless: (context) => {
            const attribute = getAttributeUnder(context.container, sentinelId);
            if (!attribute) return;
            attribute.value = value;
            return {
                /**
                 * @returns {import('./types.ts').Primitive | null}
                 */
                get() {
                    return attribute.value;
                },
                /**
                * @param {import('./types.ts').Primitive | null} value 
                */
                set(value) {
                    attribute.value = value;
                }
            }
        },
    };
}
