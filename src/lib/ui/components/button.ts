import { html } from '../../v2/index.js';
import { injectStyle } from '../styles.js';

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

const BUTTON_CSS = `
.wj-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	position: relative;
	box-sizing: border-box;
	border: none;
	cursor: pointer;
	font-family: var(--wj-font-family, "Roboto", sans-serif);
	font-size: 0.875rem;
	font-weight: 500;
	letter-spacing: 0.00625em;
	border-radius: var(--wj-shape-full, 9999px);
	text-decoration: none;
	outline: none;
	transition: box-shadow 0.2s, background-color 0.2s, color 0.2s;
}
.wj-btn:disabled {
	cursor: not-allowed;
	opacity: 0.38;
	pointer-events: none;
}
.wj-btn--small { padding: 6px 12px; min-height: 32px; font-size: 0.8125rem; }
.wj-btn--medium { padding: 10px 24px; min-height: 40px; }
.wj-btn--large { padding: 14px 32px; min-height: 48px; font-size: 1rem; }
.wj-btn--full-width { width: 100%; }

.wj-btn--filled {
	background-color: var(--wj-primary, #6750A4);
	color: var(--wj-on-primary, #FFFFFF);
}
.wj-btn--filled:hover { box-shadow: var(--wj-elevation-1, 0 1px 2px rgba(0,0,0,0.3)); }

.wj-btn--outlined {
	background-color: transparent;
	color: var(--wj-primary, #6750A4);
	border: 1px solid var(--wj-outline, #79747E);
}
.wj-btn--outlined:hover { background-color: rgba(103,80,164,0.08); }

.wj-btn--text {
	background-color: transparent;
	color: var(--wj-primary, #6750A4);
}
.wj-btn--text:hover { background-color: rgba(103,80,164,0.08); }

.wj-btn--elevated {
	background-color: var(--wj-surface, #FEF7FF);
	color: var(--wj-primary, #6750A4);
	box-shadow: var(--wj-elevation-1, 0 1px 2px rgba(0,0,0,0.3));
}
.wj-btn--elevated:hover { box-shadow: var(--wj-elevation-2, 0 2px 6px rgba(0,0,0,0.3)); }

.wj-btn--tonal {
	background-color: var(--wj-secondary-container, #E8DEF8);
	color: var(--wj-on-secondary-container, #1D192B);
}
.wj-btn--tonal:hover { box-shadow: var(--wj-elevation-1, 0 1px 2px rgba(0,0,0,0.3)); }
`;

export function Button(options: ButtonOptions = {}): HTMLButtonElement {
	injectStyle('wj-button', BUTTON_CSS);

	const variant = options.variant ?? 'filled';
	const size = options.size ?? 'medium';
	const type = options.type ?? 'button';
	const label = options.label ?? '';

	let classes = `wj-btn wj-btn--${variant} wj-btn--${size}`;
	if (options.fullWidth) classes += ' wj-btn--full-width';

	const el = html`<button type="${type}" class="${classes}">${label}</button>`;

	if (options.disabled) {
		(el as unknown as HTMLButtonElement).disabled = true;
		el.setAttribute('aria-disabled', 'true');
	}

	if (options.onClick) {
		el.addEventListener('click', options.onClick as EventListener);
	}

	return el as unknown as HTMLButtonElement;
}
