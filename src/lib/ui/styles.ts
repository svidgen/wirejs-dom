const injected = new Set<string>();

export function injectStyle(id: string, cssText: string): void {
	if (injected.has(id) || typeof document === 'undefined') return;
	injected.add(id);
	const sheet = document.createElement('style');
	sheet.textContent = cssText;
	document.head.appendChild(sheet);
}

export function _resetStyles(): void {
	injected.clear();
}
