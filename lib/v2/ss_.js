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
 * Extracts and parses the serialized data on the `wirejs-data` attribute
 * of the given Element.
 *
 * @param {Element} rendered 
 * @returns {object}
 */
export function getDataFrom(rendered) {
	return JSON.parse(rendered.getAttribute('wirejs-data') || {});
}

/**
 * Serializes the `data` tree of the given element and sets the `wirejs-data`
 * attribute of the element for later rehydration.
 * 
 * @param {Element} node 
 */
export function populateDataAttributes(node, isRoot = true) {
	const data = {};

	for (const [k, v] of Object.entries(node.data)) {
		if (v instanceof Node) {
			data[k] = { data: populateDataAttributes(v, false) };
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
 *
 * @param {Element | string} rendered - The statically rendered element with serialized `data` attributes.
 * @param {Element & { data: object }} replacement - The live element with a `data` property to populate.
 */
export function hydrate(rendered, replacement) {
	const renderedNode = 
		typeof rendered === 'string'
		? document.getElementById(rendered)
		: rendered;

	if (!rendered) {
		throw new Error('The given `rendered` value is neither an Element or a String referring to one.');
	}

	const renderedData = getDataFrom(renderedNode);
	replacement.data = renderedData;
	if (rendered.parentNode) {
		rendered.parentNode.replaceChild(replacement, rendered);
	}
}
