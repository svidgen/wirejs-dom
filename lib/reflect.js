/*
 * Infects an object with a multi-cast property and method mirroring.
 *
 * ```
 * reflect(source, ['property_a', 'property_b', 'method_a']).onto(target);
 * ```
 * 
 * The `target` object will be invoked with the same calls/values as those
 * made against the `source` on the listed properties and methods -- or
 * ALL enumerable properties and methods if none are given.
 * 
 * The only way to stop mirroring is to shatter the mirror:
 * 
 * ```
 * let mirror = reflect(source).onto(target);
 * 
 * // later.
 * mirror.shatter();
 * ```
 *
 * Once an object is being reflected, regardless of whether it is being
 * actively mirrored, it is embedded with reflection hooks. This library does
 * not currently try to remove its hooks at any time.
 *
*/
function reflect(o, props) {
	if (typeof props === 'undefined') {
		props = allPropertyNamesOf(o);
	} else if (typeof props != 'Array') {
		props = [props];
	} else {
		props = distinct(props);
	}

	o.__callbacks = o.__callbacks || {};
	o.__targets = o.__targets || [];

	props.forEach(function(p) {
		if (p === '__callbacks') return;
		if (p === '__targets') return;
		if (typeof o.__callbacks[p] === 'function') return;

		o.__callbacks[p] = callback(o, p);
		if (typeof o[p] === 'function') {
			const _originalFunction = o[p].bind(o);
			o[p] = (...args) => {
				try {
					const rv = _originalFunction(...args);
					o.__callbacks[p](...args);
					return rv;
				} catch (err) {
					throw err;
				}
			};
		} else {
			var innerValue = o[p];
			Object.defineProperty(o, p, {
				set: function(v) {
					innerValue = v;
					o.__callbacks[p](v);
				},
				get: function() {
					return innerValue;
				}
			});
			// also initialize the value on the mirrored object.
			o.__callbacks[p](o[p])
		}
	});

	return {
		onto: target => {
			o.__targets.indexOf(target) < 0 && o.__targets.push(target);
			return {
				shatter: () => {
					o.__targets.splice(o.__targets.indexOf(target), 1);
				}
			};
		}
	};
};

function callback(source, name) {
	return (...args) => {
		source.__targets.forEach(target => {
			try {
				if (typeof target[name] === 'function') {
					target[name](...args);
				} else {
					target[name] = args[0];	
				}
			} catch (err) {
				console.error(`${err}: Could not invoke ${name} on target`);
				console.log('target =', target);
			}
		});
	};
};

function distinct(items) {
	return [...(new Set([...items]))];
};

function allPropertyNamesOf(o) {
	var props = Object.getOwnPropertyNames(o);
	for (; o != null; o = Object.getPrototypeOf(o)) {
		props = [...props, ...Object.getOwnPropertyNames(o)];
	}
	return distinct(props);
};

module.exports = reflect;
