export type Primitive = string | number | boolean;

export type AttributeValue = Primitive | ((...args: any) => any) | null | undefined;

export type Identified<ID extends string, Target> = {
	id: ID;
	target: Target;
};

export type ElementContext = {
	container: HTMLElement;
};

export type ElementBuilder<
	ID extends string,
	DataType,
	RenderedType = DataType
> = {
	toString: () => string;
	id?: ID;
	bless?: (context: ElementContext) => void;

	/**
	 * @deprecated
	 *
	 * Just used to smuggle the type through.
	 */
	__dataType?: DataType;

	/**
	 * @deprecated
	 *
	 * Just used to smuggle the type through.
	 */
	__renderedType?: RenderedType;
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

export type ElementBuildersToRecordTuple<T> = {
	[K in keyof T]: T[K] extends ((...args: any[]) => any)
		? object
		: T[K] extends ElementBuilder<infer ID, infer DataType>
		? Record<ID, DataType>
		: object;
};

export type ElementBuildersToRecords<T> = T extends ReadonlyArray<any>
	? KindaPretty<UnionToIntersection<ElementBuildersToRecordTuple<T>[number]>>
	: never;

export type html = <
	T extends ReadonlyArray<
		Record<string, any> | ((evt: Event) => any)
	>
>(
	raw: ReadonlyArray<string>,
	...builders: T
) => WithExtensions<HTMLElement & { data: ElementBuildersToRecords<T> }>;

export type id = <ID extends string>(id: ID) => ElementBuilder<ID, HTMLElement>;

export type textElementBuilder = <
	ID extends string
>(
	id: ID,
	...args:
		| [ map?: (item: string) => string, value?: string[] ]
		| [ value?: string[], map?: (item: string) => string ]
) => ElementBuilder<ID, string>; 

export type list = <
	ID extends string,
	InputType = string
>(
	id: ID,
	...args:
		| [ map?: (item: InputType) => any, data?: InputType[] ]
		| [ data?: InputType[], map?: (item: InputType) => any ]
) => ElementBuilder<ID, InputType[]>;

export type node = <
	ID extends string,
	ReturnType extends HTMLElement,
	InputType = string,
>(
	id: ID,
	...args:
		| [ map?: (item?: InputType) => ReturnType, value?: InputType ]
		| [ value: InputType, map?: (item?: InputType) => ReturnType ]
) => ElementBuilder<ID, InputType>;

export type handle = (handler: (event: Event) => any) => ElementBuilder<never, never>;

export type attribute = <
	ID extends string
>(
	id: ID,
	...args:
		| [ map?: (item: AttributeValue) => AttributeValue, value?: AttributeValue[] ]
		| [ value?: AttributeValue[], map?: (item: AttributeValue) => AttributeValue ]
) => ElementBuilder<ID, AttributeValue>;

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

export type addWatcherHooks = <T extends Node>(node: T) => asserts node is T & DomEvents<T>;
