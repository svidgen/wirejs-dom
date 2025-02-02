import {
	__dataType,
	__renderedType,
} from './internals.js'

export type Primitive = string | number | boolean;

export type AttributeValue = Primitive | ((...args: any) => any) | null | undefined;

export type Identified<ID extends string, Target> = {
	id: ID;
	target: Target;
};

export type ElementContext = {
	container: HTMLElement;
	data: Record<string, unknown>;
};

export type Accessor<T> = {
	get(): T;
	set(value: T | Promise<T>): void;
}

export type ElementBuilder<
	ID extends string | undefined,
	DataType,
	RenderedType = DataType
> = {
	toString: () => string;
	id: ID;
	bless?: (context: ElementContext) => Accessor<DataType> | undefined;

	/**
	 * @deprecated
	 *
	 * Just used to smuggle the type through.
	 */
	[__dataType]: DataType;

	/**
	 * @deprecated
	 *
	 * Just used to smuggle the type through.
	 */
	[__renderedType]: RenderedType;
};

export type KindaPretty<T> = T extends (...args: any) => any
	? T
	: T extends Array<infer innerT>
	? Array<KindaPretty<innerT>>
	: T extends HTMLElement | Element
	? T
	: T extends object
	? {
		[K in keyof T]: KindaPretty<T[K]>;
	}
	: T;

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
	k: infer I,
) => void
	? I
	: never;

export type ElementBuildersToRecordTuple<T extends ReadonlyArray<any>> = {
	[K in keyof T
		as T[K] extends ElementBuilder<string, any, any>
		? K
		: never
	]: T[K] extends ElementBuilder<infer ID, infer DataType, any>
		? ID extends string ? Record<ID, DataType> : never
		: never;
};

export type ElementBuildersToRecords<T> = T extends ReadonlyArray<any>
	? KindaPretty<UnionToIntersection<ElementBuildersToRecordTuple<T>[
		keyof ElementBuildersToRecordTuple<T>
	]>>
	: never;

// export type handle = (handler: (event: Event) => any) => ElementBuilder<never, never>;

export type DomEvents<T extends Node> = {
	/**
	 * Invokes the callbacks when the node is added to the document.
	 * 
	 * @param callback
	 * @returns 
	 */
	onadd: (callback: (self: WithExtensions<T>) => any) => WithExtensions<T>;

	/**
	 * Invokes the callback when the node is removed from the document.
	 * 
	 * @param callback
	 * @returns 
	 */
	onremove: (callback: (self: WithExtensions<T>) => any) => WithExtensions<T>;
};

export type Extend<T extends Node> = {
	extend: <Extensions extends object>(
		extender: ((self: WithExtensions<T>) => Extensions)
	) => WithExtensions<T & Extensions>
};

export type WithExtensions<T extends Node> = KindaPretty<T & DomEvents<T> & Extend<T>>;

export type pendingHydration = {
	id: string;
	replacement:
		| (Element & { data: object })
		| (() => Element & { data: object })
}[];
