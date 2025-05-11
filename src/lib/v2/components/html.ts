import {
	Accessor,
	ElementBuildersToRecords,
	ElementContext,	
	WithExtensions
} from '../types.js';
import { randomId, getAttributeUnder } from '../util.js';
import { addWatcherHooks } from './dom-events.js';

export function html<T extends ReadonlyArray<unknown>>(
	raw: ReadonlyArray<string>,
	...builders: T
): WithExtensions<HTMLElement & { data: ElementBuildersToRecords<T> }> {
	// TODO: create a function hook and replace inline functions with those.
	// then, the `builder?.f` check below can go away, as the swap will just
	// act like a "normal" attribute replacement without the `id` accessor.
	const adjustedBuilders: (
		| HTMLStyleElement
		| { id: string;
			toString(): string;
			handler: () => any; }
		| {	toString: () => string;
			id: string | null;
			bless?: (context: ElementContext) => Accessor<any>;}
		| object
		| undefined
	)[] = builders.map(b => {
		if (typeof b === 'function') {
			const id = randomId();
			return {
				id,
				toString() { return id; },
				handler: b as (...args: any) => any
			};
		} else if (Array.isArray(b)) {
			const phId = randomId();
			return {
				id: null,
				toString() { return `<ph data-id=${phId}></ph>`; },
				bless(ctx: ElementContext) {
					const ph = ctx.container.querySelector(`[data-id="${phId}"]`)!;
					b.forEach(_b => _b instanceof Node
						? ph.parentNode?.insertBefore(_b, ph)
						: ph.parentNode?.insertBefore(document.createTextNode(String(_b)), ph)
					);
					ph.parentNode?.removeChild(ph);
				}
			};
		} else if (b instanceof HTMLStyleElement) {
			console.log('adding style element', b);
			document.head.appendChild(b);
		} else if (b instanceof Node) {
			const phId = randomId();
			return {
				id: null,
				toString() { return `<ph data-id=${phId}></ph>`; },
				bless(ctx: ElementContext) {
					const ph = ctx.container.querySelector(`[data-id="${phId}"]`)!;
					ph.parentNode?.replaceChild(b, ph);
				}
			};
		} else {
			return b as object;
		}
	});

	const markup = String.raw({ raw }, ...adjustedBuilders).trim();
	const firstNode = markup.trim().match(/<!?(\w+)/)![1].toLocaleLowerCase();
	const parser = new DOMParser();
	const container = parser.parseFromString(markup, 'text/html');

	const node = ({
		doctype: container.documentElement,
		html: container.documentElement,
		head: container.head,
		body: container.body,
	}[firstNode] || container.body.firstElementChild!) as unknown as
		HTMLElement & { data: Record<string, any> };
	node.data = {};

	for (const builder of adjustedBuilders) {
		if (!builder) continue;
		if (typeof builder !== 'object') continue;

		let accessor: Accessor<any> | undefined = undefined;

		if ('handler' in builder && typeof builder.handler === 'function') {
			// replace builder "text" with the actual builder function,
			// which will include the closure.
			const fAttr = getAttributeUnder(node, builder.id);
			const el = fAttr?.ownerElement
			el?.removeAttribute(fAttr!.name);
			// @ts-ignore
			el && (el[fAttr!.name] = builder.handler);
		}

		if ('bless' in builder && typeof builder.bless === "function") {
			accessor = builder.bless({ container: node, data: node.data });
		}

		// NOTE: behavior for adding accessors of varying types (e.g., list + text) is
		// explicitly not defined and not accounted for.
		if ('id' in builder && typeof builder.id === 'string') {
			appendAccessor(node, builder.id, accessor);
		}
	}

	addWatcherHooks(node);
	addExtends(node);

	return node as any;
}


const knownAccessors = new WeakMap<object, Record<string, Accessor<any>[]>>();

function appendAccessor(
	node: HTMLElement & {data: Record<string, unknown>},
	propName: string,
	accessor?: Accessor<any>
) {
	if (!knownAccessors.has(node.data)) {
		const dataProp = node.data;
		knownAccessors.set(dataProp, {});
		Object.defineProperty(node, 'data', {
			enumerable: true,
			get() {
				return dataProp;
			},
			set(newData: object) {
				for (const [k, v] of Object.entries(newData)) {
					if ( // when ...
						dataProp[k] instanceof Node // the target property IS a node,
						&& typeof (dataProp[k] as any).data === 'object' // has `data`,
						&& !(v instanceof Node) // and the intended value is NOT a node,
						&& typeof v.data === 'object' // but instead looks like "data".
					) {
						// the intention is most likely hydration of a node tree with
						// a data tree that mirrors the node tree.
						(dataProp[k] as any).data = v.data;
					} else {
						dataProp[k] = v;
					}
				}
			}
		});
	}

	const nodeAccessor = knownAccessors.get(node.data)!;
	if (!nodeAccessor[propName]) {
		const nodePropAccessors: Accessor<any>[] = [];
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

	accessor && nodeAccessor[propName].push(accessor);
}

function addExtends(target: object) {
	(target as any).extend = (buildExtensions: ((target: object) => object)) => {
		const extensions = buildExtensions(target);
		mergeExtensionsIn(target, extensions);
		return target;
	}
}

function mergeExtensionsIn(
	target: Record<string, any>,
	extensions: Record<string, any>
) {
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
