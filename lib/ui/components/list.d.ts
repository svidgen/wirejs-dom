export interface ListOptions {
    children?: Node[];
    dense?: boolean;
    disablePadding?: boolean;
}
export interface ListItemOptions {
    primary?: string | Node;
    secondary?: string | Node;
    leading?: Node;
    trailing?: Node;
    selected?: boolean;
    disabled?: boolean;
    onClick?: (event: MouseEvent) => void;
}
export declare function List(options?: ListOptions): HTMLUListElement;
export declare function ListItem(options?: ListItemOptions): HTMLLIElement;
