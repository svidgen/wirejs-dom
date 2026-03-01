import { html } from '../../v2/index.js';
import { injectStyle } from '../styles.js';

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

const INPUT_CSS = `
.wj-textfield {
	display: inline-flex;
	flex-direction: column;
	position: relative;
	font-family: var(--wj-font-family, "Roboto", sans-serif);
}
.wj-textfield--full-width {
	width: 100%;
}
.wj-textfield-inner {
	position: relative;
	display: flex;
	flex-direction: column;
	background-color: var(--wj-surface-variant, #E7E0EC);
	border-radius: var(--wj-shape-sm, 4px) var(--wj-shape-sm, 4px) 0 0;
	min-height: 56px;
}
.wj-textfield-label {
	position: absolute;
	left: 16px;
	top: 50%;
	transform: translateY(-50%);
	font-size: 1rem;
	color: var(--wj-on-surface-variant, #49454F);
	pointer-events: none;
	transition: top 0.15s ease, font-size 0.15s ease, color 0.15s ease;
}
.wj-textfield-input {
	background: transparent;
	border: none;
	border-bottom: 1px solid var(--wj-on-surface-variant, #49454F);
	outline: none;
	padding: 24px 16px 8px;
	font-size: 1rem;
	font-family: inherit;
	color: var(--wj-on-surface, #1D1B20);
	width: 100%;
	box-sizing: border-box;
}
.wj-textfield-input:focus {
	border-bottom: 2px solid var(--wj-primary, #6750A4);
}
.wj-textfield-input:focus ~ .wj-textfield-label,
.wj-textfield-input:not(:placeholder-shown) ~ .wj-textfield-label {
	top: 12px;
	transform: none;
	font-size: 0.75rem;
	color: var(--wj-primary, #6750A4);
}
.wj-textfield--error .wj-textfield-input {
	border-bottom-color: var(--wj-error, #B3261E);
}
.wj-textfield--error .wj-textfield-label {
	color: var(--wj-error, #B3261E);
}
.wj-textfield-helper {
	font-size: 0.75rem;
	padding: 4px 16px 0;
	color: var(--wj-on-surface-variant, #49454F);
	min-height: 1em;
}
.wj-textfield--error .wj-textfield-helper {
	color: var(--wj-error, #B3261E);
}
.wj-textfield-input:disabled {
	opacity: 0.38;
	cursor: not-allowed;
}
`;

export function TextField(options: TextFieldOptions = {}): TextFieldElement {
	injectStyle('wj-textfield', INPUT_CSS);

	const inputEl = document.createElement('input');
	inputEl.className = 'wj-textfield-input';
	inputEl.type = options.type ?? 'text';
	inputEl.placeholder = ' ';

	if (options.value !== undefined) inputEl.value = options.value;
	if (options.placeholder) inputEl.setAttribute('aria-label', options.placeholder);
	if (options.disabled) inputEl.disabled = true;

	if (options.onChange) {
		inputEl.addEventListener('change', () => options.onChange!(inputEl.value));
	}
	if (options.onInput) {
		inputEl.addEventListener('input', () => options.onInput!(inputEl.value));
	}
	if (options.onFocus) {
		inputEl.addEventListener('focus', options.onFocus as EventListener);
	}
	if (options.onBlur) {
		inputEl.addEventListener('blur', options.onBlur as EventListener);
	}

	const hasError = !!options.error;
	const errorMsg = typeof options.error === 'string' ? options.error : '';
	const helperMsg = errorMsg || options.helperText || '';

	let wrapperClass = 'wj-textfield';
	if (options.fullWidth) wrapperClass += ' wj-textfield--full-width';
	if (hasError) wrapperClass += ' wj-textfield--error';

	const wrapper = html`<div class="${wrapperClass}"></div>` as unknown as HTMLElement;

	const inner = html`<div class="wj-textfield-inner"></div>` as unknown as HTMLElement;
	inner.appendChild(inputEl);

	if (options.label) {
		const labelEl = html`<label class="wj-textfield-label">${options.label}</label>` as unknown as HTMLElement;
		inner.appendChild(labelEl);
	}

	wrapper.appendChild(inner);

	const helperEl = html`<div class="wj-textfield-helper">${helperMsg}</div>` as unknown as HTMLElement;
	wrapper.appendChild(helperEl);

	const extended = (wrapper as any).extend(() => ({
		getValue(): string {
			return inputEl.value;
		},
		setValue(v: string): void {
			inputEl.value = v;
		},
	})) as unknown as TextFieldElement;

	return extended;
}
