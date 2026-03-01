const monitoredNodes = new Set();
const registeredCallbacks = new WeakMap();
const nodeDomStatus = new WeakMap();
let observer = null;
function ensureRunning() {
    if (observer)
        return observer;
    observer = new MutationObserver(() => {
        for (const nodeRef of [...monitoredNodes]) {
            const node = nodeRef.deref();
            if (node) {
                const wasInDom = nodeDomStatus.get(node);
                const isInDom = document.contains(node);
                const wasAdded = isInDom && !wasInDom;
                const wasRemoved = wasInDom && !isInDom;
                nodeDomStatus.set(node, isInDom);
                if (wasAdded) {
                    registeredCallbacks.get(node)?.onadd();
                }
                else if (wasRemoved) {
                    registeredCallbacks.get(node)?.onremove();
                }
            }
            else {
                monitoredNodes.delete(nodeRef);
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return observer;
}
;
export function registerNodeDomCallbacks(node, callbacks) {
    ensureRunning();
    monitoredNodes.add(new WeakRef(node));
    registeredCallbacks.set(node, callbacks);
    nodeDomStatus.set(node, document.contains(node));
}
;
/**
 * Call the given function, capturing and logging any thrown exceptions
 * as errors.
 */
function tryToCall(f) {
    try {
        f();
    }
    catch (e) {
        console.error(e);
    }
}
export function addWatcherHooks(node) {
    const onAddWatchers = [];
    const onRemoveWatchers = [];
    let registered = false;
    const ensureCallbacksAreRegistered = () => {
        if (registered)
            return;
        registerNodeDomCallbacks(node, {
            onadd: () => onAddWatchers.forEach(tryToCall),
            onremove: () => onRemoveWatchers.forEach(tryToCall),
        });
        registered = true;
    };
    node.onadd = (f) => {
        ensureCallbacksAreRegistered();
        onAddWatchers.push(() => f(node));
        return node;
    };
    node.onremove = (f) => {
        ensureCallbacksAreRegistered();
        onRemoveWatchers.push(() => f(node));
        return node;
    };
}
