import { html } from '../../v2/index.js';
import { injectStyle } from '../styles.js';
import { appendChildren } from '../util.js';
import type { Children } from '../types.js';

export type AppBarColor = 'primary' | 'surface';

export interface AppBarOptions {
	title?: string | Node;
	children?: Children;
	actions?: Node[];
	color?: AppBarColor;
	position?: 'fixed' | 'sticky' | 'static' | 'relative';
	elevation?: boolean;
}

const APPBAR_CSS = `
.wj-appbar {
	display: flex;
	align-items: center;
	width: 100%;
	box-sizing: border-box;
	padding: 0 16px;
	min-height: 64px;
	font-family: var(--wj-font-family, "Roboto", sans-serif);
	z-index: 1100;
}
.wj-appbar--primary {
	background-color: var(--wj-primary, #6750A4);
	color: var(--wj-on-primary, #FFFFFF);
}
.wj-appbar--surface {
	background-color: var(--wj-surface, #FEF7FF);
	color: var(--wj-on-surface, #1D1B20);
}
.wj-appbar--elevated {
	box-shadow: var(--wj-elevation-2, 0 1px 2px rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15));
}
.wj-appbar--fixed { position: fixed; top: 0; left: 0; right: 0; }
.wj-appbar--sticky { position: sticky; top: 0; }
.wj-appbar--static { position: static; }
.wj-appbar--relative { position: relative; }
.wj-appbar-title {
	flex: 1;
	font-size: 1.25rem;
	font-weight: 500;
	letter-spacing: 0.0075em;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.wj-appbar-content {
	display: flex;
	align-items: center;
	flex: 1;
}
.wj-appbar-actions {
	display: flex;
	align-items: center;
	gap: 8px;
}
`;

export function AppBar(options: AppBarOptions = {}): HTMLElement {
	injectStyle('wj-appbar', APPBAR_CSS);

	const color = options.color ?? 'primary';
	const position = options.position ?? 'static';

	let classes = `wj-appbar wj-appbar--${color} wj-appbar--${position}`;
	if (options.elevation !== false) classes += ' wj-appbar--elevated';

	const el = html`<header class="${classes}"></header>` as unknown as HTMLElement;

	if (options.title) {
		const titleEl = html`<div class="wj-appbar-title"></div>` as unknown as HTMLElement;
		if (typeof options.title === 'string') {
			titleEl.textContent = options.title;
		} else {
			titleEl.appendChild(options.title);
		}
		el.appendChild(titleEl);
	}

	if (options.children) {
		const contentEl = html`<div class="wj-appbar-content"></div>` as unknown as HTMLElement;
		appendChildren(contentEl, options.children);
		el.appendChild(contentEl);
	}

	if (options.actions && options.actions.length > 0) {
		const actionsEl = html`<div class="wj-appbar-actions"></div>` as unknown as HTMLElement;
		for (const action of options.actions) {
			actionsEl.appendChild(action);
		}
		el.appendChild(actionsEl);
	}

	return el;
}
