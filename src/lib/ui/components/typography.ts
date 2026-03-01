import { html } from '../../v2/index.js';
import { injectStyle } from '../styles.js';

export type TypographyVariant =
	| 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
	| 'subtitle1' | 'subtitle2'
	| 'body1' | 'body2'
	| 'caption' | 'overline';

export interface TypographyOptions {
	children?: string | Node;
	variant?: TypographyVariant;
	color?: string;
	align?: 'left' | 'center' | 'right' | 'justify';
	gutterBottom?: boolean;
}

const TYPOGRAPHY_CSS = `
.wj-typography {
	font-family: var(--wj-font-family, "Roboto", sans-serif);
	color: var(--wj-on-background, #1D1B20);
	margin: 0;
}
.wj-typography--gutter-bottom { margin-bottom: 0.35em; }

.wj-typography--h1 { font-size: 6rem; font-weight: 300; letter-spacing: -0.015625em; line-height: 1.167; }
.wj-typography--h2 { font-size: 3.75rem; font-weight: 300; letter-spacing: -0.00833em; line-height: 1.2; }
.wj-typography--h3 { font-size: 3rem; font-weight: 400; letter-spacing: 0; line-height: 1.167; }
.wj-typography--h4 { font-size: 2.125rem; font-weight: 400; letter-spacing: 0.00735em; line-height: 1.235; }
.wj-typography--h5 { font-size: 1.5rem; font-weight: 400; letter-spacing: 0; line-height: 1.334; }
.wj-typography--h6 { font-size: 1.25rem; font-weight: 500; letter-spacing: 0.0075em; line-height: 1.6; }

.wj-typography--subtitle1 { font-size: 1rem; font-weight: 400; letter-spacing: 0.00938em; line-height: 1.75; }
.wj-typography--subtitle2 { font-size: 0.875rem; font-weight: 500; letter-spacing: 0.00714em; line-height: 1.57; }

.wj-typography--body1 { font-size: 1rem; font-weight: 400; letter-spacing: 0.00938em; line-height: 1.5; }
.wj-typography--body2 { font-size: 0.875rem; font-weight: 400; letter-spacing: 0.01071em; line-height: 1.43; }

.wj-typography--caption { font-size: 0.75rem; font-weight: 400; letter-spacing: 0.03333em; line-height: 1.66; }
.wj-typography--overline { font-size: 0.75rem; font-weight: 400; letter-spacing: 0.08333em; line-height: 2.66; text-transform: uppercase; }

.wj-typography--align-left { text-align: left; }
.wj-typography--align-center { text-align: center; }
.wj-typography--align-right { text-align: right; }
.wj-typography--align-justify { text-align: justify; }
`;

const VARIANT_TAG_MAP: Record<TypographyVariant, string> = {
	h1: 'h1',
	h2: 'h2',
	h3: 'h3',
	h4: 'h4',
	h5: 'h5',
	h6: 'h6',
	subtitle1: 'h6',
	subtitle2: 'h6',
	body1: 'p',
	body2: 'p',
	caption: 'span',
	overline: 'span',
};

export function Typography(options: TypographyOptions = {}): HTMLElement {
	injectStyle('wj-typography', TYPOGRAPHY_CSS);

	const variant = options.variant ?? 'body1';
	const tag = VARIANT_TAG_MAP[variant];
	const children = options.children ?? '';

	let classes = `wj-typography wj-typography--${variant}`;
	if (options.gutterBottom) classes += ' wj-typography--gutter-bottom';
	if (options.align) classes += ` wj-typography--align-${options.align}`;

	const el = html`<${tag} class="${classes}">${children}</${tag}>` as unknown as HTMLElement;

	if (options.color) {
		el.style.color = options.color;
	}

	return el;
}
