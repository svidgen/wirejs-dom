import type { Color } from '../types.js';
export type ChipVariant = 'filled' | 'outlined';
export interface ChipOptions {
    label?: string;
    variant?: ChipVariant;
    color?: Color;
    selected?: boolean;
    disabled?: boolean;
    onClick?: (event: MouseEvent) => void;
    onDelete?: () => void;
}
export declare function Chip(options?: ChipOptions): HTMLElement;
