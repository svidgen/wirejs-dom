import { html } from '../../v2/index.js';
import { injectStyle } from '../styles.js';

export interface DividerOptions {
	orientation?: 'horizontal' | 'vertical';
	variant?: 'fullWidth' | 'inset' | 'middle';
}

const DIVIDER_CSS = `
.wj-divider {
	border: none;
	background-color: var(--wj-outline, #79747E);
	flex-shrink: 0;
	opacity: 0.3;
}
.wj-divider--horizontal {
	display: block;
	height: 1px;
	width: 100%;
	margin: 0;
}
.wj-divider--vertical {
	display: inline-block;
	width: 1px;
	height: auto;
	align-self: stretch;
}
.wj-divider--inset { margin-left: 72px; width: calc(100% - 72px); }
.wj-divider--middle { margin-left: 16px; margin-right: 16px; width: calc(100% - 32px); }
`;

export function Divider(options: DividerOptions = {}): HTMLElement {
	injectStyle('wj-divider', DIVIDER_CSS);

	const orientation = options.orientation ?? 'horizontal';
	const variant = options.variant ?? 'fullWidth';

	let classes = `wj-divider wj-divider--${orientation}`;
	if (variant !== 'fullWidth') classes += ` wj-divider--${variant}`;

	const el = html`<hr class="${classes}" role="separator" aria-orientation="${orientation}"></hr>` as unknown as HTMLElement;
	return el;
}
