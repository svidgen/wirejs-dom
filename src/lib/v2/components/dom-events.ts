import { DomEvents } from "../types";

type Callbacks = {
	onadd: () => any;
	onremove: () => any;
}

const monitoredNodes = new Set<WeakRef<Node>>();
const registeredCallbacks = new WeakMap<Node, Callbacks>();
const nodeDomStatus = new WeakMap<Node, boolean>();

let observer: MutationObserver | null = null;
function ensureRunning() {
	if (observer) return observer;
	observer = new MutationObserver(() => {
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
	});
	observer.observe(document.body, { childList: true, subtree: true });
	return observer;
};

export function registerNodeDomCallbacks(node: Node, callbacks: Callbacks) {
	ensureRunning();
	monitoredNodes.add(new WeakRef(node));
	registeredCallbacks.set(node, callbacks);
	nodeDomStatus.set(node, document.contains(node));
};

/**
 * Call the given function, capturing and logging any thrown exceptions
 * as errors.
 */
function tryToCall(f: () => any) {
	try {
		f()
	} catch (e) {
		console.error(e);
	}
}

export function addWatcherHooks<T extends Node>(node: T): asserts node is T & DomEvents<T> {
	const onAddWatchers: Array<(() => any)> = [];
	const onRemoveWatchers: Array<(() => any)> = [];
	let registered = false;

	const ensureCallbacksAreRegistered = () => {
		if (registered) return;

		registerNodeDomCallbacks(node, {
			onadd: () => onAddWatchers.forEach(tryToCall),
			onremove: () => onRemoveWatchers.forEach(tryToCall),
		});

		registered = true;
	};

	(node as any).onadd = (f: ((self: T) => any)) => {
		ensureCallbacksAreRegistered();
		onAddWatchers.push(() => f(node));
		return node;
	};

	(node as any).onremove = (f: ((self: T) => any)) => {
		ensureCallbacksAreRegistered();
		onRemoveWatchers.push(() => f(node));
		return node;
	};
}
