import { randomId, setAttributeUnder } from '../util.js';

/**
 * @type {import('../types.ts').handle}
 */
export function handle(handler) {
    const id = randomId();
    return {
        toString: () => id,
        bless: (context) => {
            setAttributeUnder(context.container, id, handler);
        },
    };
}