import { makeElementBuilder } from "../util.js";

/**
 * @type {import('../types.js').tagIndex}
 */
export const tag = new Proxy({}, {
    get(target, property) {
        if (!target[property]) {
            target[property] = makeElementBuilder(property);
        }
        return target[property];
    }
});
