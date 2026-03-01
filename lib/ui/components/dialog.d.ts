import type { Children } from '../types.js';
export interface DialogOptions {
    title?: string | Node;
    children?: Children;
    actions?: Node[];
    open?: boolean;
    onClose?: () => void;
}
export type DialogElement = HTMLDialogElement & {
    show(): void;
    close(): void;
    isOpen(): boolean;
};
export declare function Dialog(options?: DialogOptions): DialogElement;
