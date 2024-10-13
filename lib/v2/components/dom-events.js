
/**
 * @typedef {{
 *  onadd: () => any,
 *  onremove: () => any,
 * }} Callbacks
 */

/**
 * @type {Set<WeakRef<Node>}
 */
const monitoredNodes = new Set();

/**
 * @type {WeakMap<Node, Callbacks>}
 */
const registeredCallbacks = new WeakMap();

/**
 * @type {WeakMap<Node, boolean>}
 */
const nodeDomStatus = new WeakMap();

let observer = null;
function ensureRunning() {
    observer = observer || new MutationObserver(() => {
        for (const nodeRef of [...monitoredNodes]) {
            const node = nodeRef.deref()
            if (node) {
                const wasInDom = nodeDomStatus.get(node);
                const isInDom = document.contains(node);
                const wasAdded = isInDom && !wasInDom;
                const wasRemoved = wasInDom && !isInDom;
                nodeDomStatus.set(node, isInDom);

                if (wasAdded) {
                    registeredCallbacks.get(node)?.onadd();
                } else if (wasRemoved) {
                    registeredCallbacks.get(node)?.onremove();
                }
            } else {
                monitoredNodes.delete(nodeRef);
            }
        }
    }).observe(document.body, { childList: true, subtree: true });
    return observer;
};

/**
 * @param {Node} node 
 * @param {Callbacks} callbacks
 */
export function registerNodeDomCallbacks(node, callbacks) {
    ensureRunning();
    monitoredNodes.add(new WeakRef(node));
    registeredCallbacks.set(node, callbacks);
    nodeDomStatus.set(node, document.contains(node));
};

export function createNodeDomCallbacks(node) {
    
}