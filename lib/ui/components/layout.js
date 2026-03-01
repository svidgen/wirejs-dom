import { html } from '../../v2/index.js';
import { injectStyle } from '../styles.js';
import { appendChildren } from '../util.js';
const LAYOUT_CSS = `
.wj-container {
	width: 100%;
	box-sizing: border-box;
	margin-left: auto;
	margin-right: auto;
}
.wj-container--gutters { padding-left: 16px; padding-right: 16px; }
.wj-container--xs { max-width: 444px; }
.wj-container--sm { max-width: 600px; }
.wj-container--md { max-width: 900px; }
.wj-container--lg { max-width: 1200px; }
.wj-container--xl { max-width: 1536px; }
.wj-container--full { max-width: 100%; }

.wj-stack {
	display: flex;
}
.wj-stack--row { flex-direction: row; }
.wj-stack--column { flex-direction: column; }
.wj-stack--wrap { flex-wrap: wrap; }

.wj-section {
	width: 100%;
	box-sizing: border-box;
}
`;
const SIZE_GAP = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
};
const SIZE_PADDING = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
};
export function Container(options = {}) {
    injectStyle('wj-layout', LAYOUT_CSS);
    const maxWidth = options.maxWidth ?? 'lg';
    let classes = `wj-container wj-container--${maxWidth}`;
    if (!options.disableGutters)
        classes += ' wj-container--gutters';
    const el = html `<div class="${classes}"></div>`;
    appendChildren(el, options.children);
    return el;
}
export function Stack(options = {}) {
    injectStyle('wj-layout', LAYOUT_CSS);
    const direction = options.direction ?? 'column';
    let classes = `wj-stack wj-stack--${direction}`;
    if (options.wrap)
        classes += ' wj-stack--wrap';
    const el = html `<div class="${classes}"></div>`;
    if (options.gap) {
        const gapVal = options.gap in SIZE_GAP
            ? SIZE_GAP[options.gap]
            : options.gap;
        el.style.gap = gapVal;
    }
    if (options.align)
        el.style.alignItems = options.align;
    if (options.justify)
        el.style.justifyContent = options.justify;
    appendChildren(el, options.children);
    return el;
}
export function Row(options = {}) {
    return Stack({ ...options, direction: 'row' });
}
export function Section(options = {}) {
    injectStyle('wj-layout', LAYOUT_CSS);
    const el = html `<section class="wj-section"></section>`;
    if (options.padding) {
        const padVal = options.padding in SIZE_PADDING
            ? SIZE_PADDING[options.padding]
            : options.padding;
        el.style.padding = padVal;
    }
    appendChildren(el, options.children);
    return el;
}
