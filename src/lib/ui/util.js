export function appendChildren(el, children) {
    if (children === undefined || children === null)
        return;
    if (Array.isArray(children)) {
        for (const child of children) {
            if (typeof child === 'string') {
                el.appendChild(document.createTextNode(child));
            }
            else {
                el.appendChild(child);
            }
        }
    }
    else if (typeof children === 'string') {
        el.appendChild(document.createTextNode(children));
    }
    else {
        el.appendChild(children);
    }
}
