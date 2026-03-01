import type { Children } from '../types.js';
export interface CardOptions {
    title?: string;
    subtitle?: string;
    children?: Children;
    actions?: Node[];
    elevated?: boolean;
    outlined?: boolean;
    onClick?: (event: MouseEvent) => void;
}
export declare function Card(options?: CardOptions): HTMLElement;
