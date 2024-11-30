/**
 * Returns an identifier string that can be used as an ID in the DOM.
 * 
 * Will only contain numbers and underscores, and so be used directly
 * for attributes without quotes, if needed.
 * 
 * @returns {string}
 */
export function randomId() {
    return `${new Date().getTime()}_${Math.floor(Math.random() * 1000000)}`;
}

/**
 * Finds the attribute on a node containing the `id` string.
 * 
 * Returns `null` if there is no match.
 *
 * @param {Element} node 
 * @param {string} id 
 * @returns 
 */
export function matchingAttribute(node, id) {
    for (const attribute of node.attributes) {
        if (attribute.value === id) return attribute;
    }
    return null;
}

/**
 * Finds the attributing containing the given `id` string at or
 * under the given `root` Node.
 *
 * Returns `undefined` if there is no match.
 *
 * @param {Element} root 
 * @param {string} id 
 * @returns {Attr}
 */
export function getAttributeUnder(root, id) {
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
 * Finds the attribute at or under the given `root` matching the
 * given `id` and sets its value to the given `value`.
 *
 * @param {Element} root 
 * @param {string} id 
 * @param {any} value 
 */
export function setAttributeUnder(root, id, value) {
    const attribute = getAttributeUnder(root, id);
    if (attribute) {
        attribute.value = value;
        return attribute;
    }
}
