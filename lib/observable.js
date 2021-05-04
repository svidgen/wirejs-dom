class DynamicValue {
	_value;

	consructor(value) {
		this.set(value);
	}

	this.value = function() {
		return this._value;
	}; // valueOf()

	this.set = function(value) {
		this._value = value;
		on(this, 'change').fire();
	}; // set()

	setType(this, 'TG.Value');
}; // TG.Value()
