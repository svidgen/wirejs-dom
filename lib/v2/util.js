/**
 * Sets up an execution environment in SSR/SSG/test contexts using the given
 * `JSDOM`-compatible constructor. This setup function creates a document using the
 * given constructor and exports all globals `wirejs-dom` needs from the `window` on
 * that document.
 * 
 * ```js
 * import { JSDOM } from 'jsdom';
 * import { html, useJSDOM } from 'wirejs-dom';
 * 
 * // this is idempotent, but only needs to be done once.
 * useJSDOM(JSDOM);
 * 
 * // you can then continue to use wirejs-dom
 * const widget = html`<div>do your thing</div>`;
 * ```
 * 
 * @param {object} JSDOM
 */
export function useJSDOM(JSDOM) {
    if (global.window) return;

    const DOM = new JSDOM('<!doctype html><html><body></body></html>', {
        pretendToBeVisual: true
    });

    global.window = DOM.window;
    global.document = window.document;
    global.Element = window.Element;
    global.Node = window.Node;
    global.NodeList = window.NodeList;
    global.DOMParser = DOM.window.DOMParser;
    global.MutationObserver = DOM.window.MutationObserver;
}

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