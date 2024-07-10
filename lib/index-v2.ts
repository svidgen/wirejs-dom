export type Identified<ID extends string, Target> = {
	id: ID;
	target: Target;
};

export type ElementContext = {
	container: Element;
};

export type ElementBuilder<ID extends string, Target> = {
	toString: () => string;
	id?: ID;
	bless?: (context: ElementContext) => void;

	/**
	 * @deprecated
	 *
	 * Just used to smuggle the type through.
	 */
	__targetType?: Target;
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
	[K in keyof T]: T[K] extends ElementBuilder<infer ID, infer Target>
	? Record<ID, Target>
	: unknown;
};

export type ElementBuildersToRecords<T> = T extends ReadonlyArray<any>
	? KindaPretty<UnionToIntersection<ElementBuildersToRecordTuple<T>[number]>>
	: never;