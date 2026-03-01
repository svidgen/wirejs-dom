const injected = new Set();
export function injectStyle(id, cssText) {
    if (injected.has(id) || typeof document === 'undefined')
        return;
    injected.add(id);
    const sheet = document.createElement('style');
    sheet.textContent = cssText;
    document.head.appendChild(sheet);
}
export function _resetStyles() {
    injected.clear();
}
