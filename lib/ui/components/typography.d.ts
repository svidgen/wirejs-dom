export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'overline';
export interface TypographyOptions {
    children?: string | Node;
    variant?: TypographyVariant;
    color?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
    gutterBottom?: boolean;
}
export declare function Typography(options?: TypographyOptions): HTMLElement;
