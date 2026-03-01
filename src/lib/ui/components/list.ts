import { html } from '../../v2/index.js';
import { injectStyle } from '../styles.js';

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

const LIST_CSS = `
.wj-list {
	list-style: none;
	margin: 0;
	padding: 8px 0;
	font-family: var(--wj-font-family, "Roboto", sans-serif);
}
.wj-list--dense { padding: 4px 0; }
.wj-list--no-padding { padding: 0; }

.wj-list-item {
	display: flex;
	align-items: center;
	padding: 8px 16px;
	min-height: 48px;
	box-sizing: border-box;
	cursor: default;
	color: var(--wj-on-surface, #1D1B20);
	transition: background-color 0.15s;
}
.wj-list-item--clickable { cursor: pointer; }
.wj-list-item--clickable:hover { background-color: rgba(0,0,0,0.04); }
.wj-list-item--selected { background-color: var(--wj-primary-container, #EADDFF); }
.wj-list-item--disabled { opacity: 0.38; cursor: not-allowed; pointer-events: none; }
.wj-list--dense .wj-list-item { min-height: 36px; padding: 4px 16px; }

.wj-list-item-leading {
	margin-right: 16px;
	display: flex;
	align-items: center;
	flex-shrink: 0;
}
.wj-list-item-content {
	flex: 1;
	overflow: hidden;
}
.wj-list-item-primary {
	font-size: 1rem;
	font-weight: 400;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.wj-list-item-secondary {
	font-size: 0.875rem;
	color: var(--wj-on-surface-variant, #49454F);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.wj-list-item-trailing {
	margin-left: 16px;
	display: flex;
	align-items: center;
	flex-shrink: 0;
}
`;

export function List(options: ListOptions = {}): HTMLUListElement {
	injectStyle('wj-list', LIST_CSS);

	let classes = 'wj-list';
	if (options.dense) classes += ' wj-list--dense';
	if (options.disablePadding) classes += ' wj-list--no-padding';

	const el = html`<ul class="${classes}"></ul>` as unknown as HTMLUListElement;

	if (options.children) {
		for (const child of options.children) {
			el.appendChild(child);
		}
	}

	return el;
}

export function ListItem(options: ListItemOptions = {}): HTMLLIElement {
	injectStyle('wj-list', LIST_CSS);

	let classes = 'wj-list-item';
	if (options.onClick) classes += ' wj-list-item--clickable';
	if (options.selected) classes += ' wj-list-item--selected';
	if (options.disabled) classes += ' wj-list-item--disabled';

	const el = html`<li class="${classes}"></li>` as unknown as HTMLLIElement;

	if (options.leading) {
		const leadingEl = html`<div class="wj-list-item-leading"></div>` as unknown as HTMLElement;
		leadingEl.appendChild(options.leading);
		el.appendChild(leadingEl);
	}

	const contentEl = html`<div class="wj-list-item-content"></div>` as unknown as HTMLElement;

	if (options.primary) {
		const primaryEl = html`<div class="wj-list-item-primary"></div>` as unknown as HTMLElement;
		if (typeof options.primary === 'string') {
			primaryEl.textContent = options.primary;
		} else {
			primaryEl.appendChild(options.primary);
		}
		contentEl.appendChild(primaryEl);
	}

	if (options.secondary) {
		const secondaryEl = html`<div class="wj-list-item-secondary"></div>` as unknown as HTMLElement;
		if (typeof options.secondary === 'string') {
			secondaryEl.textContent = options.secondary;
		} else {
			secondaryEl.appendChild(options.secondary);
		}
		contentEl.appendChild(secondaryEl);
	}

	el.appendChild(contentEl);

	if (options.trailing) {
		const trailingEl = html`<div class="wj-list-item-trailing"></div>` as unknown as HTMLElement;
		trailingEl.appendChild(options.trailing);
		el.appendChild(trailingEl);
	}

	if (options.selected) {
		el.setAttribute('aria-selected', 'true');
	}
	if (options.disabled) {
		el.setAttribute('aria-disabled', 'true');
	}
	if (options.onClick) {
		el.addEventListener('click', options.onClick as EventListener);
	}

	return el;
}
