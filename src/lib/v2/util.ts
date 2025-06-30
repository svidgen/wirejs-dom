/**
 * Returns an identifier string that can be used as an ID in the DOM.
 * 
 * Will only contain numbers and underscores, and so be used directly
 * for attributes without quotes, if needed.
 */
export function randomId() {
    return `${new Date().getTime()}_${Math.floor(Math.random() * 1000000)}`;
}

/**
 * Finds the attribute on a node containing the `id` string.
 * 
 * Returns `null` if there is no match.
 */
export function matchingAttribute(node: Element, id: string) {
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
 */
export function getAttributeUnder(root: Element, id: string) {
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
 */
export function setAttributeUnder(root: Element, id: string, value: any) {
    const attribute = getAttributeUnder(root, id);
    if (attribute) {
        attribute.value = value;
        return attribute;
    }
}

export function isPromise<RT>(o: unknown): o is Promise<RT> {
    return !!o && typeof o === 'object' && 'then' in o && typeof o.then === 'function';
}

export function findCommentNode(root: Node, match: string): Node | null {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
    let current: Node | null;
    while (current = walker.nextNode()) {
        if (current.nodeValue?.trim() === match) {
            return current;
        }
    }
    return null;
}
