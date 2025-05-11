/**
 * Create a style element with the given CSS.
 * 
 * Safe to inject directly into elements created with `html`.
 * 
 * @param css 
 * @param args 
 * @returns 
 */
export function css(
	css: TemplateStringsArray,
	...args: any[]
): HTMLStyleElement {
	const formatted = String.raw({ raw: css }, ...args);
	const sheet = document.createElement('style');
	sheet.textContent = formatted;
	return sheet;
}