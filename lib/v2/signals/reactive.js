import { signal } from "./signal.js";

/**
* 
* @param {TemplateStringsArray} raw 
* @param  {...any} args 
* @returns 
*/
export function reactive(raw, ...args) {
    const render = () => String.raw({ raw }, ...args);
    const s = signal(render());
    for (const arg of args) {
        if (typeof arg?.subscribe === 'function') {
            arg.subscribe(() => s.value = render());
        }
    }
    return s;
}