import { isPromise } from "./util.js";

// Functions used to support SSR, SSG, and related functions such as building
// "DOM" nodes in a non-browser environment. (E.g., `useJSDOM()`)

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
 */
export function useJSDOM(JSDOM: any) {
    if (global.window) return;

    const DOM = new JSDOM('<!doctype html><html><body></body></html>', {
        pretendToBeVisual: true
    });

    global.window = DOM.window;
	for (const k of Object.getOwnPropertyNames(window)) {
		try {
			// @ts-ignore
			global[k] = global[k] || window[k];
		} catch {
			// JSDOM throws a fit when we try to access certain items.
			// those items will be available in SSR/SSG contexts.
		}
	}
}

/**
 * Extracts and parses the serialized data on the `wirejs-data` attribute
 * of the given Element.
 */
export function getDataFrom(rendered: HTMLElement) {
	return JSON.parse(rendered.getAttribute('wirejs-data') || '{}');
}

/**
 * Serializes the `data` tree of the given element and sets the `wirejs-data`
 * attribute of the element for later rehydration.
 */
export function dehydrate(node: HTMLElement & { data?: object }, isRoot = true) {
	const data = {} as Record<string, any>;

	for (const [k, v] of Object.entries(node.data || {})) {
		if (v instanceof HTMLElement) {
			data[k] = { data: dehydrate(v, false) };
		} else {
			data[k] = v;
		}
	}

	if (isRoot) {
		try {
			node.setAttribute('wirejs-data', JSON.stringify(data));
		} catch {
			console.error("Data for node could not be serialized.", node);
		}
	} else {
		return data;
	}
}

/**
 * Hydrates a live element from a statically rendered element's serialized
 * `wirejs-data` attribute and replaces the rendered element in its DOM if it
 * has a `parentNode`.
 * 
 * This function should be called explicitly for each "top level" element that
 * requires hydration. This is intended to allow granular control over hydration.
 * 
 * Example Usage:
 * 
 * ```js
 * // find the statically rendered element to replace.
 * const serverElement = document.getElementById('todo-list');
 *
 * // create the live element that will replace it.
 * const liveElement = createTodoList();
 *
 * // perform hydration, making the live element's `data` property match
 * // the static element and replacing the static element.
 * hydrate(serverElement, liveElement);
 * ```
 *
 * If `rendered` is a string, it will be treated like an `id`. The element will
 * be found using `getElementById`.
 */
export function hydrate(
	rendered: HTMLElement | string,
	replacement:
		| ((Element | HTMLElement | Node) & { data: object })
		| ((init: { data: object }) => ((Element | HTMLElement | Node) & { data: object }))
		| ((init: { data: object }) => Promise<((Element | HTMLElement | Node) & { data: object })>)
) {
	const renderedNode = 
		typeof rendered === 'string'
		? document.getElementById(rendered)
		: rendered;

	if (!renderedNode) {
		// @ts-ignore
		globalThis.pendingDehydrations = globalThis.pendingDehydrations || [];
		// @ts-ignore
		globalThis.pendingDehydrations.push((doc: any) => {
			// remember, `rendered` is the `id` here:
			const element = doc.parentNode?.getElementById(rendered)
			if (element) {
				dehydrate(element);
			}
		});
		return;
	}

	const renderedData = getDataFrom(renderedNode);

	const replacementNodeOrPromise = (
		typeof replacement === 'function'
		? replacement({ data: renderedData })
		: replacement
	);

	if (isPromise(replacementNodeOrPromise)) {
		replacementNodeOrPromise['then'](replacementNode => {
			replacementNode.data = renderedData;
			if (renderedNode.parentNode) {
				renderedNode.parentNode.replaceChild(replacementNode, renderedNode);
			}
		})
	} else {
		replacementNodeOrPromise['data'] = renderedData;
		if (renderedNode.parentNode) {
			renderedNode.parentNode.replaceChild(
				replacementNodeOrPromise as Node,
				renderedNode
			);
		}
	}
};
