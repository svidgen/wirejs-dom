
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

/**
 * Call the given function, capturing and logging any thrown exceptions
 * as errors.
 * 
 * @param {() => any} f 
 */
function tryToCall(f) {
	try {
		f()
	} catch (e) {
		console.error(e);
	}
}

/**
 * @type {import('../types').addWatcherHooks}
 */
export function addWatcherHooks(node) {
	/**
	 * @type {Array<() => {}>}
	 */
	const onAddWatchers = [];

	/**
	 * @type {Array<() => {}>}
	 */
	const onRemoveWatchers = [];

	let registered = false;

	const ensureCallbacksAreRegistered = () => {
		if (registered) return;

		registerNodeDomCallbacks(node, {
			onadd: () => onAddWatchers.forEach(tryToCall),
			onremove: () => onRemoveWatchers.forEach(tryToCall),
		});

		registered = true;
	};

	node.onadd = (f) => {
		ensureCallbacksAreRegistered();
		onAddWatchers.push(f);
		return node;
	};

	node.onremove = (f) => {
		ensureCallbacksAreRegistered();
		onRemoveWatchers.push(f);
		return node;
	};
}
