export type ButtonVariant = 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
export type ButtonSize = 'small' | 'medium' | 'large';
export interface ButtonOptions {
    label?: string | Node;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    onClick?: (event: MouseEvent) => void;
    type?: 'button' | 'submit' | 'reset';
    fullWidth?: boolean;
}
export declare function Button(options?: ButtonOptions): HTMLButtonElement;
