function attachNodeAttributes (o, node) {
	var node = node || o;
	if (!o.__attributes_imported
		&& node.attributes && node.attributes.length
	) {
		for (var i = 0; i < node.attributes.length; i++) {
			var a = node.attributes[i];

			// this needs to be thought through and tested more. it may make
			// sense to *always* add the property if it was given on a tag
			// attribute like this.
			if (!o[a.name]) {
				o[a.name] = a.value;
			}
		}
	}
	o.__attributes_imported = true;
};

module.exports = attachNodeAttributes;
