import { signal, collectSignals } from "./signal.js";

/**
 * @template Args
 * @template RT
 * @param {((...args: Args) => RT)} f
 */
export function computed(f) {
    const s = signal(undefined);
    const subscriptions = [];

    /**
     * Wrapper for `f` which clears existing subscriptions and re-watches
     * for signals that are invoked during the resolution of `f`. The next time
     * one of those signals fires, we re-evaluate -- again -- re-building the
     * list of signals that matter to the result of the evaluation (because it
     * can change from evaluation to evaluation when there is branching).
     * 
     * @returns {ReturnType<typeof f>}
     */
    function evaluate() {
        while (subscriptions.length > 0) {
            const unsubscribe = subscriptions.pop();
            unsubscribe();
        }

        for (const signals of collectSignals()) {
            try {
                s.value = f();
            } finally {
                for (const collected of signals) {
                    subscriptions.push(collected.subscribe(evaluate));
                }
            }
        }
    };

    evaluate();
    return s;
};