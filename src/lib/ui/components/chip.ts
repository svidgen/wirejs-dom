import { html } from '../../v2/index.js';
import { injectStyle } from '../styles.js';
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

const CHIP_CSS = `
.wj-chip {
	display: inline-flex;
	align-items: center;
	border-radius: var(--wj-shape-full, 9999px);
	height: 32px;
	padding: 0 12px;
	font-family: var(--wj-font-family, "Roboto", sans-serif);
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	user-select: none;
	box-sizing: border-box;
	transition: background-color 0.2s, box-shadow 0.2s;
	gap: 4px;
}
.wj-chip:focus { outline: 2px solid var(--wj-primary, #6750A4); outline-offset: 2px; }
.wj-chip[aria-disabled="true"] { opacity: 0.38; cursor: not-allowed; pointer-events: none; }
.wj-chip[aria-selected="true"] { font-weight: 700; }

.wj-chip--filled { background-color: var(--wj-surface-variant, #E7E0EC); color: var(--wj-on-surface-variant, #49454F); border: none; }
.wj-chip--filled:hover { box-shadow: var(--wj-elevation-1, 0 1px 2px rgba(0,0,0,0.3)); }
.wj-chip--outlined { background-color: transparent; color: var(--wj-on-surface, #1D1B20); border: 1px solid var(--wj-outline, #79747E); }
.wj-chip--outlined:hover { background-color: rgba(103,80,164,0.08); }

.wj-chip--color-primary.wj-chip--filled { background-color: var(--wj-primary-container, #EADDFF); color: var(--wj-on-primary-container, #21005D); }
.wj-chip--color-secondary.wj-chip--filled { background-color: var(--wj-secondary-container, #E8DEF8); color: var(--wj-on-secondary-container, #1D192B); }
.wj-chip--color-error.wj-chip--filled { background-color: var(--wj-error-container, #F9DEDC); color: var(--wj-on-error-container, #410E0B); }

.wj-chip-delete {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 18px;
	height: 18px;
	border-radius: 50%;
	cursor: pointer;
	font-size: 1rem;
	line-height: 1;
	opacity: 0.7;
	background: none;
	border: none;
	padding: 0;
	color: inherit;
}
.wj-chip-delete:hover { opacity: 1; background-color: rgba(0,0,0,0.1); }
`;

export function Chip(options: ChipOptions = {}): HTMLElement {
	injectStyle('wj-chip', CHIP_CSS);

	const variant = options.variant ?? 'filled';
	const color = options.color ?? 'surface';
	const label = options.label ?? '';

	let classes = `wj-chip wj-chip--${variant} wj-chip--color-${color}`;

	const el = html`<div class="${classes}" role="button" tabindex="0"></div>` as unknown as HTMLElement;

	el.textContent = label;

	if (options.selected) {
		el.setAttribute('aria-selected', 'true');
	}
	if (options.disabled) {
		el.setAttribute('aria-disabled', 'true');
	}
	if (options.onClick) {
		el.addEventListener('click', options.onClick as EventListener);
	}
	if (options.onDelete) {
		const deleteBtn = html`<button class="wj-chip-delete" aria-label="Delete" tabindex="-1">✕</button>` as unknown as HTMLElement;
		deleteBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			options.onDelete!();
		});
		el.appendChild(deleteBtn);
	}

	return el;
}
