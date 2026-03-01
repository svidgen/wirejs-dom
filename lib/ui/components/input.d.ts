export interface TextFieldOptions {
    label?: string;
    value?: string;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: string | boolean;
    helperText?: string;
    fullWidth?: boolean;
    onChange?: (value: string) => void;
    onInput?: (value: string) => void;
    onFocus?: (event: FocusEvent) => void;
    onBlur?: (event: FocusEvent) => void;
}
export type TextFieldElement = HTMLElement & {
    getValue(): string;
    setValue(value: string): void;
};
export declare function TextField(options?: TextFieldOptions): TextFieldElement;
