const attachNodeAttributes = require('./attach-node-attributes.js');

function getNodes(n, q) {
	var rv;

	if (typeof (q) === 'function' && typeof(q.getBindings) === 'function') {
		rv = [];
		const bindings = q.getBindings();
		for (var i = 0; i < bindings.length; i++) {
			var _rv = getNodes(n, bindings[i]);
			for (var ii = 0; ii < _rv.length; ii++) {
				rv.push(_rv[ii]);
			}
		}
		return rv;
	}

	q = q.replace(/:/g, '\\:');
	rv = n.querySelectorAll(q);

	for (var i = 0; i < rv.length; i++) {
		attachNodeAttributes(rv[i]);
	}

	return Array.prototype.slice.call(rv, 0);
};

module.exports = getNodes;
