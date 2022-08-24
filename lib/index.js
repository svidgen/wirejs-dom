const { isa, getTypeId, setType, registerType } = require('./types');
const getNodes = require('./get-nodes');
const attachNodeAttributes = require('./attach-node-attributes.js');

function DomClass(template, constructor) {
	constructor = constructor || function NullConstructor() {};
	constructor.template = template ? template.trim() : null;
	Bind(constructor);
	const f = function(arg) { return New(constructor, arg); };
	f.apply = function(_t, _a) { constructor.apply(_t, _a); };
	f.call = function() {
		var _t = Array.prototype.shift.apply(arguments);
		return constructor.call(_t, arguments);
	};
	f.__constructor = constructor;
	f.name = constructor.name;
	f.getBindings = () => Bind.getBindings(f);
	return f;
};

// clears all bindings
DomClass.clear = function() {
	Bind.Classes = {};
};

function Bind(constructor, template, scope) {
	if (typeof (constructor) == 'function') {
		var binding = Bind.addBinding(template, constructor);
		constructor.binding = binding;
		var nodes = getNodes(isa(scope, Node) ? scope : document, binding);
		Bind.Apply(constructor, nodes);
		return nodes.length;
	} else if (isa(constructor, Node)) {
		Bind.BindExistingConstructors(constructor);
	}
};

Bind.BindExistingConstructors = function(node, f) {
	var deps = [];
	var bindings = (f && f.dependencies) || Bind.Classes;
	for (var binding in bindings) {
		if (Bind(Bind.Classes[binding], binding, node) > 0) {
			deps[binding] = 1;
		}
	}
	(f && !f.dependencies) ? (f.dependencies = deps) : null;
}; // this.Bind.BindExistingConstructors()

Bind.Apply = function(constructor, nodes) {
	for (var i = 0; i < nodes.length; i++) {
		var n = nodes[i];
		if (!n.__AlreadyBound) {
			Bind.importParameters(constructor, n);
			Bind.ApplyClone(constructor, n);
			Bind.ApplyConstructor(constructor, n);
			attachNodeAttributes(n);
			n.__AlreadyBound = true;
		}
	}
}; // Apply()

Bind.ApplyTemplate = function (constructor, node) {
	var { compiled } = Bind.compile(constructor)
	if (compiled) {
		node.innerHTML = compiled;
	}
}; // ApplyTemplate()

Bind.ApplyClone = function(constructor, node) {
	// makes sense, but what problem did this conditional solve?
	// ... optimization?
	if (!Bind.compile(constructor)) { return; }

	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
	var clone = Bind.getClone(constructor);
	if (clone.childNodes.length == 0) clone = node.__holdingDiv;
	while (clone.firstChild) {
		node.appendChild(clone.removeChild(clone.firstChild));
	}
}; // ApplyClone

Bind.ApplyConstructor = function(constructor, node) {
	Bind.BindExistingConstructors(node, constructor);
	setType(node, constructor);
	Bind.attachIdentifiedChildren(node);
	Bind.applyParameters(node);
	constructor.apply(node);
	if (typeof node.init === 'function') node.init();
}; // ApplyConstructor()

Bind.applyProperties = function(node, obj) {
	var o = typeof(obj) == 'object' ? obj : {};
	for (var i in o) {
		if (o.hasOwnProperty(i)) node[i] = o[i];
	}
}; // applyProperties()


Bind.originalCreateElement = document.createElement;
Bind.createNode = function(constructor, tag) {
	var { tag, className = '' } = tag ? { tag } : Bind.compile(constructor);
	var container = Bind.originalCreateElement.call(document, 'div');
	if (tag.indexOf(':') == 0) { tag = tag.substr(1); }
	container.innerHTML = '<' + tag + '></' + tag + '>';
	var rv = container.firstChild;
	rv.className = className || '';
	return rv;
}; // createNode()

Bind.Classes = {};


document.createElement = function(tag, o) {
	var constructor = Bind.getConstructor(tag);
	if (constructor) {
		var node = Bind.getClone(constructor);
		Bind.applyProperties(node, o);
		Bind.ApplyConstructor(constructor, node);
		node.__AlreadyBound = true;
	} else {
		var node = Bind.originalCreateElement.call(this, tag);
		Bind.applyProperties(node, o);
	}
	return node;
};

Bind.getClone = function(constructor) {
	if (!constructor.templateNode) {
		constructor.templateNode = Bind.createNode(constructor);
		Bind.ApplyTemplate(constructor, constructor.templateNode);
	}
	return constructor.templateNode.cloneNode(true);
}; 

Bind.addBinding = function(template, constructor) {
	const compiled = Bind.compile(constructor, template);
	Bind.Classes[compiled.tag] = constructor;
	return compiled.tag;
}; // addBinding()


Bind.getConstructor = function(binding) {
	return Bind.Classes[binding]
		|| Bind.Classes[binding.toLowerCase()]
		|| Bind.Classes[binding.toUpperCase()]
	;
}; // getConstructor()


Bind.getBindings = function(constructor) {
	var rv = [];
	for (var i in Bind.Classes) {
		if (Bind.Classes[i] === constructor
			|| Bind.Classes[i] === constructor.__constructor
		) {
			rv.push(i);
		}
	}

	return rv;
}; // getBindings()

Bind.makeNodeFrom = function(o, collectionType) {
	if (isa(o, Node) || isa(o, Element)) {
		return o;
	}

	if (isa(o, Array)) {
		var rv = document.createElement('div');
		Bind.addArrayAsChildren(rv, o);
		return rv;
	}

	if (typeof(o) != 'object') {
		var rv = document.createElement('div');
		rv.innerHTML = o;
		return rv;
	}

	var constructor = null;
	if (collectionType) {
		constructor = Bind.getConstructor(collectionType);
	}

	if (constructor) {
		return New(constructor, o);
	}

	var node = document.createElement('div');
	node.innerHTML = o;
	return node;
}; 

Bind.addArrayAsChildren = function(node, values, collectionType) {
	collectionType = collectionType || node['data-collection'] || node.getAttribute('data-collection');
	while (node.firstChild) node.removeChild(node.firstChild);
	for (var i = 0; i < values.length; i++ ) {
		values[i] = Bind.makeNodeFrom(values[i], collectionType);
		if (values[i].parentNode) values[i].parentNode.removeChild(values[i]);
		node.appendChild(values[i]);
	};
}; // addArrayAsChildren()

Bind.childNodeArray = function(node) {
	var rv = [];
	rv.events = {};

	var collectionType = node['data-collection'] || node.getAttribute('data-collection');

	rv.render = function() {
		// todo: optimize / apply delta
		Bind.addArrayAsChildren(node, rv);
	};

	rv.loadFromDOM = function(newNode) {
		if (newNode) node = newNode;
		var childNodes = [];

		var childType = node['data-collection']
			|| node.getAttribute('data-collection');

		if (childType) {
			childNodes = getNodes(node, childType);
		} else {
			childNodes = Array.prototype.slice.call(node.childNodes);
		}

		rv.length = 0;

		childNodes.forEach(function(child) {
			rv.push(child);
		});
	}; 

	rv.push = function(v) {
		var n = Bind.makeNodeFrom(v, collectionType);
		node.appendChild(n);
		return Array.prototype.push.call(rv, n);
	};

	rv.pop = function() {
		node.removeChild(n);
		return Array.prototype.pop.apply(rv);
	};

	rv.shift = function() {
		node.removeChild(n);
		return Array.prototype.shift.apply(rv);
	};

	rv.unshift = function(v) {
		var n = Bind.makeNodeFrom(v, collectionType);
		node.insertBefore(n, node.firstChild);
		return Array.prototype.unshift.call(rv, n);
	};

	rv.splice = function() {
		var params = Array.prototype.slice.call(arguments, 0);
		var index = params.shift();
		var count = params.shift() || rv.length;
		var newItems = params || [];

		for (var i = index; i < index + count; i++) {
			var n = rv[i];
			node.removeChild(n);
		}

		var insertBeforeNode = rv[i];
		newItems.forEach(function(item) {
			node.insertBefore(item, insertBeforeNode);
		});

		return Array.prototype.splice.apply(rv, arguments);
	};

	var modifiers = [
		// 'push', 'pop', 'shift', 'unshift',
		// 'slice'
		// 'splice',
		'reverse', 'sort'
	];

	for (var i = 0; i < modifiers.length; i++) { (function() {
		var m = modifiers[i];
		rv[m] = function() {
			var r = Array.prototype[m].apply(rv, arguments);
			rv.render();
			return r;
		}
	})(); }

	rv.loadFromDOM();

	return rv;
}; // childNodeArray()

Bind.defineAccessors = function(node, obj, id) {
	var descriptor = Object.getOwnPropertyDescriptor(obj, id);
	if (descriptor && descriptor.configurable == false) {
		return;
	}

	if (node.__accessorDefined) {
		return;
	}
	Object.defineProperty(node, '__accessorDefined', {
		get: function() { return true; },
		enumerable: false
	});

	var existing_value = obj[id];

	var default_property = 'innerHTML';
	if (typeof(node.value) == 'string') {
		default_property = 'value';
	}
	var target_property = node.getAttribute('data-property');
	var last_set = target_property;
	var childCollection = Bind.childNodeArray(node);

	obj.__dom = obj.__dom || {};
	Object.defineProperty(obj.__dom, id, {
		get: function() { return node; }
	});

	Object.defineProperty(obj, '__dom', {
		enumerable: false
	});

	var enumerable = true;
	if (node['data-ignore'] || node.getAttribute('data-ignore')) {
		enumerable = false;
	}

	Object.defineProperty(obj, id, {
		get: function() {
			if (target_property == 'children'
				|| last_set == 'children'
				|| node['data-collection']
				|| node.getAttribute('data-collection')
			) {
				return childCollection;
			} else if (target_property) {
				return node[target_property];
			} else if (last_set) {
				return node[last_set];
			} else {
				return node;
			}
		},
		set: function(v) {
			var setThisValue = function(vv) {
				if (isa(vv, Array)) {
					Bind.addArrayAsChildren(node, vv);
					last_set = 'children';
				} else if (isa(vv, Node)) {
					if (node.parentNode) node.parentNode.replaceChild(vv, node);
					node = vv;
					last_set = null;
				} else if (isa(vv, Object)) {
					for (var vv_k in vv) {
						node[vv_k] = vv[vv_k];
					}
					last_set = null;
				} else if (target_property) {
					node[target_property] = vv;
					last_set = target_property;
				} else {
					node[default_property] = vv;
					last_set = default_property;
				}
			}; // setThisValue()

			if (!v) {
				setThisValue(v);
			} else if (typeof v.then === 'function') {
				// support for promises
				v.then(result => setThisValue(result)).catch(console.error);
			} else if (typeof v.onto === 'function') {
				// support for wirejs-reflect-ions
				v.onto(childCollection.loadFromDOM(node));
			} else {
				// default behavior. just set the value.
				setThisValue(v);
				childCollection.loadFromDOM(node);
			}

			// setThisValue(v.valueOf());
			// childCollection.loadFromDOM(node);
		},
		enumerable: enumerable,
		configurable: false
	});

}; // defineAccessors()

// attach nodes with a data-id to the object ... o.{data-id}
Bind.attachIdentifiedChildren = function (o, node) {
	var nodes = (node || o).querySelectorAll('[data-id]');
	nodes = Array.prototype.slice.call(nodes, 0);
	for (var i = 0; i < nodes.length; i++) {
		var id = nodes[i].getAttribute('data-id');
		var initial_value = o[id];
		Bind.defineAccessors(nodes[i], o, id);
		if (initial_value) {
			o[id] = initial_value;
		}
	};
}; // Bind.attachIdentifiedChildren()


Bind.compile = function(constructor) {
	if (!constructor.compilation) {
		const sample = Bind.buildSampleContainer(constructor.template);
		const compiled = Bind.compileTemplate(sample);
		const { tag, className } = Bind.findBinding(sample);
		constructor.compilation = {
			template: constructor.template,
			compiled,
			tag,
			className
		};
	}
	return constructor.compilation;
}; // templateFor

Bind.buildSampleContainer = function(template) {
	const container = document.createElement('div');
	container.innerHTML = template;
	return container;
};

Bind.compileTemplate = function(container) {
	if (container.childNodes.length === 1) {
		return container.firstChild.innerHTML;
	} else {
		return container.innerHTML;
	}
};

Bind.findBinding = function(node) {
	if (node.childNodes && node.childNodes.length === 1) {
		node = node.firstChild;
	}
	return {
		tag: node.tagName,
		className: node.className
	};
};


Bind.importParameters = function (constructor, o, node) {
	var node = node || o;
	if (!o.__parameters_imported && node.childNodes) {
		o.parameters = [];

		for (var i = 0; i < node.childNodes.length; i++) {
			var n = node.childNodes[i];
			if (n.nodeType && n.nodeType == 3 && n.data && n.data.replace(/\s/g, '')) {
				// special treatment for IE 8 text nodes
				var _n = document.createElement('span');
				_n.innerHTML = n.data;
				n = _n;
			}
			o.parameters.push(n);
		}

		if (Bind.compile(constructor) != null) {
			o.__holdingDiv = document.createElement('div');
			o.__holdingDiv.style.display = 'none';
			document.body.appendChild(o.__holdingDiv);

			for (var i = 0; i < o.parameters.length; i++) {
				o.__holdingDiv.appendChild(o.parameters[i]);
			}
			// not 100% sure why parameters aren't being bound
			// during the regular Bind() calls, but in some cases they're not:
			Bind(o.__holdingDiv);
		}
	}
	o.__parameters_imported = true;
}; // importParameters()


Bind.applyParameters = function (o) {
	if (!o.parameters || !isa(o.parameters, Array) || !o.__holdingDiv) {
		return;
	}
	var nodes = o.parameters;
	for (var i = nodes.length - 1; i >= 0; i--) {
		var id = nodes[i]['data-id'];

		if (!id && typeof(nodes[i]['getAttribute']) == 'function') {
			id = nodes[i].getAttribute('data-id');
		}

		if (id) {
			o[id] = nodes[i];
		}
	}
	o.__holdingDiv.parentNode.removeChild(o.__holdingDiv);
	delete o.__holdingDiv;
}; // applyParameters()


Bind.copyDefaultAttributes = function(from, to) {
	if (!isa(from, Node) || !isa(to, Node)) return;
	for (var i = 0; i < from.attributes.length; i++) {
		var name = from.attributes[i].name;
		if (!to.hasAttribute(name)) {
			to.setAttribute(name, from.attributes[i].value);
			to[name] = from.attributes[i].value;
		}
	}
};


Bind.getChildren = function (o, query) {
	if (!o.childNodes) {
		return [];
	}

	var rv = [];

	// not the most efficient solution. but an easy one!
	var _rv = getNodes(o, query);
	for (var i = 0; i < _rv.length; i++) {
		if (_rv[i].parentNode === o) {
			rv.push(_rv[i]);
		}
	}

	return rv;
}; // getChildren()


function Build(constructor, o) {
	var _o = o || {};
	var n = null;

	for (var i in Bind.Classes) {
		if (Bind.Classes[i] === constructor) {
			n = document.createElement(i, _o);
			break;
		}
	}

	if (n === null) {
		n = o;
		constructor.apply(n);
	}

	return n;
};

const New = Build;


module.exports = {
	DomClass, bless: Bind,
	isa, getTypeId, setType, registerType,
	getNodes
};
