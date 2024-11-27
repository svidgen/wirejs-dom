import { randomId, getAttributeUnder } from '../util.js';
import { addWatcherHooks } from './dom-events.js';

/**
 * @type {import('../types').html} 
 */
export function html(
	raw,
	...builders
) {
	// TODO: create a function hook and replace inline functions with those.
	// then, the `builder?.f` check below can go away, as the swap will just
	// act like a "normal" attribute replacement without the `id` accessor.
	const adjustedBuilders = builders.map(b => {
		if (typeof b === 'function') {
			const id = randomId();
			return { id, toString() { return id; }, f: b };
		} else if (Array.isArray(b)) {
			const phId = randomId();
			return {
				id: null,
				toString() { return `<ph data-id=${phId}></ph>`; },
				bless(ctx) {
					const ph = ctx.container.querySelector(`[data-id="${phId}"]`);
					b.forEach(_b =>
						typeof _b === 'string'
						? ph.parentNode.insertBefore(document.createTextNode(_b), ph)
						: ph.parentNode.insertBefore(_b, ph)
					);
					ph.parentNode.removeChild(ph);
				}
			};
		} else if (b instanceof Node) {
			const phId = randomId();
			return {
				id: null,
				toString() { return `<ph data-id=${phId}></ph>`; },
				bless(ctx) {
					const ph = ctx.container.querySelector(`[data-id="${phId}"]`);
					ph.parentNode.replaceChild(b, ph);
				}
			};
		} else {
			return b;
		}
	});

	const markup = String.raw({ raw }, ...adjustedBuilders).trim();
	const firstNode = markup.trim().match(/<!?(\w+)/)[1].toLocaleLowerCase();
	const parser = new DOMParser();
	const container = parser.parseFromString(markup, 'text/html');

	/**
	 * @type {Element}
	 */
	const node = {
		doctype: container.documentElement,
		html: container.documentElement,
		head: container.head,
		body: container.body,
	}[firstNode] || container.body.firstElementChild;

	node.data = {};

	for (const builder of adjustedBuilders) {
		let accessor;

		if (typeof builder?.f === 'function') {
			// replace builder "text" with the actual builder function,
			// which will include the closure.
			const fAttr = getAttributeUnder(node, builder.id);
			const e = fAttr.ownerElement
			e.removeAttribute(fAttr.name);
			e[fAttr.name] = builder.f;
		}

		if (typeof builder?.bless === "function") {
			accessor = builder.bless({ container: node, data: node.data });
		}

		// NOTE: behavior for adding accessors of varying types (e.g., list + text) is
		// explicitly not defined and not accounted for.
		if (builder?.id) {
			appendAccessor(node, builder.id, accessor);
		}
	}

	addWatcherHooks(node);
	addExtends(node);

	return node;
}


/**
 * @type {WeakMap<object, Record<string, {get: () => any, set(v: any) => void}[]>}
 */
const knownAccessors = new WeakMap();

/**
 * 
 * @param {HTMLElement & {data: object}} node 
 */
function appendAccessor(node, propName, accessor) {
	if (!knownAccessors.has(node.data)) {
		const dataProp = {}
		knownAccessors.set(dataProp, {});
		Object.defineProperty(node, 'data', {
			enumerable: true,
			get() {
				return dataProp;
			},
			set(newData) {
				for (const [k, v] of Object.entries(newData)) {
					if (dataProp[k] instanceof Node
						&& !(v instanceof Node)
						&& typeof dataProp[k].data === 'object'
						&& typeof v.data === 'object'
					) {
						dataProp[k].data = v.data;
					} else {
						dataProp[k] = v;
					}
				}
			}
		});
	}

	const nodeAccessor = knownAccessors.get(node.data);
	if (!nodeAccessor[propName]) {
		const nodePropAccessors = []
		nodeAccessor[propName] = nodePropAccessors;
		Object.defineProperty(
			node.data,
			propName,
			{
				get() {
					// just defer to the first one as the record of truth.
					return nodePropAccessors[0]?.get();
				},
				set(v) {
					// updates, on the other hand, must be broadcast to each.
					for (const a of nodePropAccessors) {
						a.set(v);
					}
				},
				enumerable: true
			}
		);
	}

	nodeAccessor[propName].push(accessor);

	// try {
	// 	node.setAttribute(
	// 		`wirejs-data-${propName}`,
	// 		JSON.stringify(node.data[propName])
	// 	);
	// } catch {
	// 	console.warn("Cannot serialize default value: ", v);
	// }
}

/**
 * 
 * @param {object} target 
 */
function addExtends(target) {
	/**
	 * @template T
	 * @param {(node: object) => T} extend
	 */
	target.extend = (buildExtensions) => {
		const extensions = buildExtensions(target);
		mergeExtensionsIn(target, extensions);
		return target;
	}
}

/**
 * 
 * @param {object} target 
 * @param {object} extensions 
 */
function mergeExtensionsIn(target, extensions) {
	for (const [k, v] of Object.entries(extensions)) {
		if (k in target) {
			// recursively merge properties in if `k` already exists on the target.
			// this may need to become more nuanced over time as folks try to merge
			// things into other things that aren't actually objects ... maybe.
			if (typeof v === 'object') {
				mergeExtensionsIn(target[k], v);
			} else {
				target[k] = v;
			}
		} else {
			target[k] = v;
		}
	}
}
