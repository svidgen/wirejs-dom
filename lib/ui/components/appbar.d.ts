import type { Children } from '../types.js';
export type AppBarColor = 'primary' | 'surface';
export interface AppBarOptions {
    title?: string | Node;
    children?: Children;
    actions?: Node[];
    color?: AppBarColor;
    position?: 'fixed' | 'sticky' | 'static' | 'relative';
    elevation?: boolean;
}
export declare function AppBar(options?: AppBarOptions): HTMLElement;
