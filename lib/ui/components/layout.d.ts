import type { Children, Size } from '../types.js';
export interface ContainerOptions {
    children?: Children;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    disableGutters?: boolean;
}
export interface StackOptions {
    children?: Children;
    direction?: 'row' | 'column';
    gap?: Size | string;
    align?: string;
    justify?: string;
    wrap?: boolean;
}
export interface RowOptions extends Omit<StackOptions, 'direction'> {
}
export interface SectionOptions {
    children?: Children;
    padding?: Size | string;
}
export declare function Container(options?: ContainerOptions): HTMLDivElement;
export declare function Stack(options?: StackOptions): HTMLDivElement;
export declare function Row(options?: RowOptions): HTMLDivElement;
export declare function Section(options?: SectionOptions): HTMLElement;
