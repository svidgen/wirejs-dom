import { html } from '../../v2/index.js';
import { injectStyle } from '../styles.js';
import { appendChildren } from '../util.js';
const CARD_CSS = `
.wj-card {
	background-color: var(--wj-surface, #FEF7FF);
	color: var(--wj-on-surface, #1D1B20);
	border-radius: var(--wj-shape-md, 8px);
	overflow: hidden;
	display: flex;
	flex-direction: column;
	font-family: var(--wj-font-family, "Roboto", sans-serif);
}
.wj-card--elevated {
	box-shadow: var(--wj-elevation-1, 0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15));
}
.wj-card--outlined {
	border: 1px solid var(--wj-outline, #79747E);
}
.wj-card--clickable {
	cursor: pointer;
}
.wj-card--clickable:hover {
	background-color: rgba(103,80,164,0.05);
}
.wj-card-header {
	padding: 16px 16px 0;
}
.wj-card-title {
	font-size: 1.25rem;
	font-weight: 500;
	letter-spacing: 0.0075em;
	margin: 0 0 4px;
}
.wj-card-subtitle {
	font-size: 0.875rem;
	color: var(--wj-on-surface-variant, #49454F);
	margin: 0;
}
.wj-card-content {
	padding: 16px;
	flex: 1;
}
.wj-card-actions {
	display: flex;
	align-items: center;
	padding: 8px;
	gap: 8px;
}
`;
export function Card(options = {}) {
    injectStyle('wj-card', CARD_CSS);
    let classes = 'wj-card';
    if (options.elevated)
        classes += ' wj-card--elevated';
    if (options.outlined)
        classes += ' wj-card--outlined';
    if (options.onClick)
        classes += ' wj-card--clickable';
    const el = html `<div class="${classes}"></div>`;
    if (options.title) {
        const header = html `<div class="wj-card-header"></div>`;
        const titleEl = html `<div class="wj-card-title">${options.title}</div>`;
        header.appendChild(titleEl);
        if (options.subtitle) {
            const subtitleEl = html `<div class="wj-card-subtitle">${options.subtitle}</div>`;
            header.appendChild(subtitleEl);
        }
        el.appendChild(header);
    }
    const content = html `<div class="wj-card-content"></div>`;
    appendChildren(content, options.children);
    el.appendChild(content);
    if (options.actions && options.actions.length > 0) {
        const actionsEl = html `<div class="wj-card-actions"></div>`;
        for (const action of options.actions) {
            actionsEl.appendChild(action);
        }
        el.appendChild(actionsEl);
    }
    if (options.onClick) {
        el.addEventListener('click', options.onClick);
    }
    return el;
}
