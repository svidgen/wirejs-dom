Element = global.Element || function () { return true; };
Node = global.Node || Element;

function getTypeId(t) {
	var id = t;
	if (typeof(t) === 'function' && typeof(t.getBindings) === 'function') {
		var bound = t.getBindings();
		if (bound.length > 0) {
			id = bound[0];
		} else {
			id = t.name || t.toString();
		}
	}
	return id;
};

function setType(o, constructor) {
	o.__types = o.__types || {};
	var t = getTypeId(constructor);
	if (t && o.__types[t] == null) {
		var v = 0;
		for (var i in o.__types) {
			v = Math.max(v, o.__types[i]);
		}
		v += 1;
		o.__types[t] = v;
	}
};

function isa(o, constructor) {
	var oT = typeof(o);
	var cT = typeof(constructor);

	if (oT === 'string') {
		return constructor === String;
	}
	if (oT === 'number') {
		return constructor === Number;
	}
	if (o === undefined || o === null) {
		return cT === oT;
	}
	if (oT === 'boolean') {
		return oT == cT;
	}

	if (cT === 'string' || cT === 'function') {
		o.__types = o.__types || {};
		if (constructor && o.__types[getTypeId(constructor)]) {
			return true;
 		}
	}

	if (
		constructor === Element
		|| constructor === Node
		|| constructor === NodeList
		|| cT  === 'function'
	) {
		return o instanceof constructor;
	}
	return o === constructor;
};

module.exports = {
	isa: isa,
	getTypeId: getTypeId,
	setType: setType,
	registerType: setType 
};
