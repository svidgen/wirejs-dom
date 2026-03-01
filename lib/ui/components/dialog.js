import { html } from '../../v2/index.js';
import { injectStyle } from '../styles.js';
import { appendChildren } from '../util.js';
const DIALOG_CSS = `
.wj-dialog {
	border: none;
	border-radius: var(--wj-shape-lg, 16px);
	padding: 0;
	background-color: var(--wj-surface, #FEF7FF);
	color: var(--wj-on-surface, #1D1B20);
	font-family: var(--wj-font-family, "Roboto", sans-serif);
	min-width: 280px;
	max-width: 560px;
	box-shadow: var(--wj-elevation-3, 0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3));
}
.wj-dialog::backdrop {
	background-color: rgba(0, 0, 0, 0.5);
}
.wj-dialog-title {
	font-size: 1.5rem;
	font-weight: 400;
	padding: 24px 24px 16px;
	margin: 0;
}
.wj-dialog-content {
	padding: 0 24px 24px;
	overflow-y: auto;
}
.wj-dialog-actions {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 8px;
	padding: 8px 24px 24px;
}
`;
export function Dialog(options = {}) {
    injectStyle('wj-dialog', DIALOG_CSS);
    const el = html `<dialog class="wj-dialog"></dialog>`;
    if (options.title) {
        const titleEl = html `<div class="wj-dialog-title"></div>`;
        if (typeof options.title === 'string') {
            titleEl.textContent = options.title;
        }
        else {
            titleEl.appendChild(options.title);
        }
        el.appendChild(titleEl);
    }
    const contentEl = html `<div class="wj-dialog-content"></div>`;
    appendChildren(contentEl, options.children);
    el.appendChild(contentEl);
    if (options.actions && options.actions.length > 0) {
        const actionsEl = html `<div class="wj-dialog-actions"></div>`;
        for (const action of options.actions) {
            actionsEl.appendChild(action);
        }
        el.appendChild(actionsEl);
    }
    if (options.onClose) {
        el.addEventListener('close', options.onClose);
    }
    if (options.open) {
        el.setAttribute('open', '');
    }
    const extended = el.extend(() => ({
        show() {
            el.setAttribute('open', '');
        },
        close() {
            el.removeAttribute('open');
        },
        isOpen() {
            return el.hasAttribute('open');
        },
    }));
    return extended;
}
