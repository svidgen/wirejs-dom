const QUnit = require('qunit');

// const Observable = require('zen-observable');

let fixture = document.createElement('div');
document.body.appendChild(fixture);

const {
    DomClass, bless, reflect,
    isa, getTypeId, setType, registerType,
    getNodes
} = require('../lib/index');

QUnit.testStart(() => {
	DomClass.clear();
	fixture.innerHTML = '';
});

QUnit.module("wirejs-v1");

QUnit.test("isa() identifies core JS types", function(assert) {
	var und;
	var nul = null;
	var num = 123;
	var str = "string";
	var arr = [];
	var obj = {};
	var fun = function() {};

	assert.ok(isa(und, undefined), "undefined was correctly identified");
	assert.ok(isa(nul, null), "null was correctly identified");
	assert.ok(isa(num, Number), "Number was correctly identified");
	assert.ok(isa(str, String), "String was correctly identified");
	assert.ok(isa(arr, Array), "Array was correctly identified");
	assert.ok(isa(obj, Object), "Object was correctly identified");
	assert.ok(isa(fun, Function), "Function was correctly identified");
});

QUnit.test("isa() identifies Nodes", function(assert) {
	var n = document.createElement('div');
	assert.ok(isa(n, Node), "div was identified as a Node instance");
});

QUnit.test("isa() identifies constructors", function(assert) {
	var f1 = function() {};
	var f2 = function() {};
	var o1 = new f1();
	var o2 = new f2();
	assert.ok(isa(o1, f1) && isa(o2, f2), "instances are correctly identified against their own constructors");
	assert.ok(!isa(o1, f2) && !isa(o2, f1), "instances are not falsely identified against other constructors");
});

QUnit.test("setType() & isa() mark and recognize named types", function(assert) {
	var o = {};
	assert.ok(!isa(o, 'something'), "object without named type 'something' is correclty identified has not having the explicit type");
	setType(o, "something");
	assert.ok(isa(o, 'something'), "object with named type 'something' is correctly identified");
});

QUnit.test("setType() and isa() mark and recognize unnamed functions", function(assert) {
	var o = {};
	var fn = function(a,b) { console.log(a, b); };
	assert.ok(!isa(o, fn), "object without type is identified as not having the type");

	setType(o, fn);
	assert.ok(isa(o, fn), "object WITH type is identified as HAVING the type");
});

QUnit.test("DomClass(t, c) uses template to build new C()", function(assert) {
	const C = DomClass('<t:c>Wee!</t:c>', function() {});
	const n = new C();
	assert.ok(n.innerHTML == 'Wee!', "innerHTML matched the templateMarkup");
});

QUnit.test("DomClass ignores whitespace around template", function(assert) {
	const body = "did it ignore whitespace?";
	const C = DomClass(`
		<t:c>${body}</t:c>
	`);
	const n = new C();
	assert.ok(n.innerHTML == body, "class is expected to render only the template node <t:c>...</t:c>");
});

QUnit.test("DomClass() attaches pre-existing nodes as properties of `this` in constructors", function(assert) {
	const template = "<t:c>Welcome <span data-id='name'>Person</span>!</t:c>";
	const C = DomClass(template, function() {
		var nameNode = this.name;
		this.getNameNode = function() {
			return nameNode;
		};
	});
	var n = new C();

	assert.ok(isa(n.name, Node), "n.name is a Node");
	assert.ok(isa(n.getNameNode(), Node), "n.getPreNameNode is a node");
	assert.ok(n.name === n.getNameNode(), "n.name and n.getPreNameNode are the same");
	assert.ok(n.name.innerHTML == "Person", "n.name.innerHTML is 'Person'");
});

QUnit.test("Direct assignment to blessed node properties updates the DOM", function(assert) {
	const C = DomClass("<t:c>Hello <span data-id='world'>World</span>!</t:c>");
	var n = new C();

	var galaxy = document.createElement('span');
	galaxy.innerHTML = "Galaxy";
	n.world = galaxy;

	assert.ok(n.innerHTML == "Hello <span>Galaxy</span>!", "the nodes innerHTML now contains the new markup in place of the old");

	var spans = getNodes(n, 'span');
	assert.strictEqual(spans[0], galaxy, "the inserted node IS the created and assigned node");
});

QUnit.test("DomClass calls init() after instantiation", function(assert) {
	const C = DomClass("<t:c></t:c>", function() {
		this.initialized = false;
		this.init = function() {
			this.initialized = true;
		};
	});

	let c = new C();
	assert.ok(c.initialized);
});

QUnit.test("DomClass calls init() after hydration", function(assert) {
	fixture.innerHTML = "<t:c>... yeah.</t:c>";

	const C = DomClass("<t:c></t:c>", function() {
		this.initialized = false;
		this.init = function() {
			this.initialized = true;
		};
	});

	const c = fixture.firstChild;
	assert.ok(c.initialized);
});

QUnit.test("DomClass attaches to existing matching DOM node and attaches identified nodes under target node `this`", function(assert) {
	let foundNode = null;

	fixture.innerHTML = "<t:c>Hello <span data-id='person'>Alf</span>.</t:c>";
	const C = DomClass("<t:c></t:c>", function() {
		foundNode = this;
	});

	assert.ok(foundNode, "the target node was bound");
	assert.strictEqual(foundNode.person.innerHTML, 'Alf',
		"the person attribute contained the correct markup"
	);
	assert.ok(foundNode.innerHTML.match(/Hello/), "Other content is left in tact, as the template is empty");

	var cat = document.createElement('span');
	cat.innerHTML = 'Cat';
	foundNode.person = cat;
	assert.ok(fixture.innerHTML.match(/Cat/), "after assigning `cat` to `person`, the DOM is updated");
});

QUnit.test("DomClass attaches to existing DOM node, attaches ID'd nodes, but ignores extra markup when template is present", function(assert) {
	let foundNode = null;
	fixture.innerHTML = "<t:c>Hello <span data-id='person'>Alf</span>.</t:c>";
	const C = DomClass("<t:c>Not Empty</t:c>", function() {
		foundNode = this;
	});

	assert.ok(foundNode, "the target node was bound");
	assert.strictEqual(foundNode.person.innerHTML, 'Alf',
		"the person attribute contained the correct markup"
	);
	assert.false(!!foundNode.innerHTML.match(/Hello/), "other content is ignored");
	assert.false(!!fixture.innerHTML.match(/Hello/), "original content is not left lingering in the DOM");
});

QUnit.test("DomClass substitutes nodes from the target in place of the identified templateMarkup nodes", function(assert) {
	fixture.innerHTML = "<t:c><span data-id='world'>Werrrld</span></t:c>";
	const template = "<t:c>Hi there <span data-id='world'>World</span>!</t:c>";
	const C = DomClass(template);

	assert.ok(fixture.innerHTML.match(/>Hi there/), "the updated markup has Hello in it");
	assert.ok(fixture.innerHTML.match(/>Werrrld</), "the updated markup has the new Werrrld node in it");
});

QUnit.test("DomClass inserts tag attribute text into the target node's innerHTML and value fields.", function(assert) {
	fixture.innerHTML = "<t:c world='Guy'></t:c>";
	DomClass("<t:c>Hello <span data-id='world'>World</span>!</t:c>");

	assert.ok(fixture.firstChild.innerHTML.match(/Guy/), "the updated markup has attr-arg ('Guy') injected into the doc");
	assert.equal(fixture.firstChild.world, 'Guy', "The associated object property should match the supplied string");
});

QUnit.test("DomClass targets an ID'd nodes innerHTML when data-property='innerHTML' is set", function(assert) {
	const C = DomClass("<t:c>Hello <span data-id='world' data-property='innerHTML'>World</span>!</t:c>");
	var c = new C();
	
	assert.ok(c.world === 'World', "the associated property returns the inner markup");

	c.world = "Not World";
	assert.strictEqual(c.world, 'Not World', "assigning to the property changes the return value");
	assert.ok(c.innerHTML.match(/>Not World</), "the containing node's markup reflected the desired markup change.");

});

QUnit.test("DomClass accessors are serializeable with JSON.stringify()", function(assert) {
	const C = DomClass("<t:c>Hello <span data-id='world' data-property='innerHTML'>World</span>!</t:c>");
	var c = new C();
	var serialization = JSON.stringify(c);
	var deserialized = JSON.parse(serialization);

	assert.deepEqual(
		deserialized,
		{ world: "World" },
		"the JSON contains the 'world' property value and ONLY that property"
	);
});

QUnit.test("DomClass serialization can be nested to singleton children", function (assert) {
	const Parent = DomClass(`<t:parent>
		Hello.
		<t:child data-id='kid'></t:child>
	</t:parent>`);

	const Child = DomClass(`<t:child>
		<div data-id='hello' data-property='innerHTML'>my child</div>
	</t:child>`);

	const node = new Parent();
	var serialization = JSON.stringify(node);
	var deserialized = JSON.parse(serialization);

	assert.equal(typeof node.kid.toJSON, 'function');
	assert.deepEqual(
		deserialized,
		{ kid: { hello: "my child" } },
		"The full tree should be safely serialized."
	);
});

QUnit.test("DomClass serialization can serialize nested collections, children added after init", function (assert) {
	const Parent = DomClass(`<t:parent>
		Hello.
		<div data-id='kids' data-collection='t:child'></t:div>
	</t:parent>`);

	const Child = DomClass(`<t:child>
		<div data-id='hello' data-property='innerHTML'>my child</div>
	</t:child>`);

	const node = new Parent();
	node.kids = [
		{hello: "franky"},
		{hello: "billy"},
		{hello: "bobby"},
	];

	var serialization = JSON.stringify(node);
	var deserialized = JSON.parse(serialization);

	assert.deepEqual(
		deserialized,
		{
			kids: [
				{hello: "franky"},
				{hello: "billy"},
				{hello: "bobby"},
			].map(v => ({...v, class:''})) // `className`... not sure if dev will want this stripped
		},
		"The full tree should be safely serialized."
	);
});

QUnit.test("DomClass serialization can serialize nested collections, initialized with children", function (assert) {
	const Parent = DomClass(`<t:parent>
		Hello.
		<div data-id='kids' data-collection='t:child'></t:div>
	</t:parent>`);

	const Child = DomClass(`<t:child>
		<div data-id='hello' data-property='innerHTML'>my child</div>
	</t:child>`);

	const node = new Parent({
		kids: [
			{hello: "franky"},
			{hello: "billy"},
			{hello: "bobby"},
		]
	});

	var serialization = JSON.stringify(node);
	var deserialized = JSON.parse(serialization);

	assert.deepEqual(
		deserialized,
		{
			kids: [
				{hello: "franky"},
				{hello: "billy"},
				{hello: "bobby"},
			].map(v => ({...v, class:''})) // `className`... not sure if dev will want this stripped
		},
		"The full tree should be safely serialized."
	);
});

QUnit.test("DomClass serialization can seed re-instantiation", function (assert) {
	const Parent = DomClass(`<t:parent>
		Hello.
		<div data-id='kids' data-collection='t:child'></t:div>
	</t:parent>`);

	const Child = DomClass(`<t:child>
		<div data-id='hello' data-property='innerHTML'>my child</div>
	</t:child>`);

	const base = new Parent({
		kids: [
			{hello: "franky"},
			{hello: "billy"},
			{hello: "bobby"},
		]
	});

	const node = new Parent(JSON.parse(JSON.stringify(base)));

	var serialization = JSON.stringify(node);
	var deserialized = JSON.parse(serialization);

	assert.deepEqual(
		deserialized,
		{
			kids: [
				{hello: "franky"},
				{hello: "billy"},
				{hello: "bobby"},
			].map(v => ({...v, class:''})) // `className`... not sure if dev will want this stripped
		},
		"The full tree should be safely serialized (again)."
	);
});

QUnit.test("DomClass properties resolve promises", async function(assert) {
	const C = DomClass("<t:c><span data-id='world'>bahh</span></t:c>");
	var c = new C();
	var o = Promise.resolve('hello');
	c.world = o;
	await o;
	assert.equal(c.world, 'hello', "`world` property is the Promise value");
	assert.ok(c.innerHTML.match(/hello/), "new `world` value is present in markup");
});

QUnit.test.skip("DomClass mirrors reflections", async function(assert) {
	const C = DomClass("<t:c><span data-id='greet'></span></t:c>");
	const c = new C();

	const person = ['initial'];
	c.greet = reflect(person);

	assert.equal(c.greet, 'initial', "`greet` should be initial");

	person[0] = 'updated';
	assert.equal(c.greet, 'updated', "`greet` should be updated");
});

QUnit.test.skip("Multiple DomClasses can subscribe to a generic observable", function(assert) {
	// const person = Observable.of("one", "two", "three");
	//
	let observer;
	const person = new Observable(o => { observer = o; });

	const C = DomClass("<t:c><span data-id='greet'></span></t:c>");
	const c1 = new C();
	const c2 = new C();
	
	c1.greet = person;
	c2.greet = person;
	
	observer.next('one');
	observer.next('two');
	observer.next('three');

	assert.equal(c1.greet, 'three', "`greet` property was updated on `c1`");
	// assert.equal(c2.greet, 'three', "`greet` property was updated on `c2`");
});

QUnit.test("DomClass also initializes child constructors", function(assert) {
	const P = DomClass(
		`<t:p><div data-id='pvalue' data-property='innerHTML'>p hello</div>
		<t:c data-id='cnode' class='c'></t:c></t:p>`,
		function () {}
	);

	const C = DomClass(
		"<t:c><div data-id='cvalue' data-property='innerHTML'>c hello</div></t:c>",
		function () {}
	);
	
	const n = new P();

	assert.equal(n.pvalue, 'p hello', 'parent value property is set');
	assert.equal(n.cnode.cvalue, 'c hello', 'child value property is set');
});

// ok wat. why isn't this working?
QUnit.skip("DomClass nodes identify properly with `isa`", function(assert) {
	const P = DomClass(
		`<t:p>
			<div data-id='pvalue' data-property='innerHTML'>hello</div>
			<t:c data-id='cnode'></t:c>
		</t:p>`
	)

	const C = DomClass(
		`<t:c>
			<div data-id='cvalue' data-property='innerHTML'>hello</div>
		</t:c>`
	);
 
	var n = new P();

	// troubleshooting ... 
	console.log('P type', getTypeId(P));
	console.log('C type', getTypeId(C));
	console.log('n type', n.__types);
	console.log('n.cnode type', n.cnode.__types);
	console.log('n.constructor', n.constructor);
	console.log('n instanceof P', n instanceof P.constructor);

	assert.ok(isa(n, P), "the root node identifies as P");
	assert.ok(isa(n.cnode, C), "the child node identifies as C");
});

QUnit.test("DomClass applies nested initializer properties to nested nodes", function(assert) {
	const P = new DomClass(
		`<t:p>
			<div data-id='pvalue' data-property='innerHTML'>hello</div>
			<t:c data-id='cnode' class='c'></t:c>
		</t:p>`
	);

	const C = new DomClass(
		"<t:c><div data-id='cvalue' data-property='innerHTML'>hello</div></t:c>"
	);
 
	var n = new P({ pvalue: 'parent', cnode: { cvalue: 'child' }});

	assert.equal(n.pvalue, 'parent', 'parent value property is set');
	assert.equal(n.cnode.cvalue, 'child', 'child value property is set');
});

QUnit.test("DomClass applies nested child collection initializers", function (assert) {
	const P = new DomClass(`<t:p>
		<div data-id='child_values' data-collection='t:c'></div>
	</t:p>`);

	const C = new DomClass(`<t:c>
		<span data-id="value" data-property='innerHTML'></span>
	</t:c>`);

	const n = new P({child_values: [
		{value: 'a'},
		{value: 'b'},
		{value: 'c'},
	]});

	assert.equal(n.child_values.length, 3);
	assert.equal(n.child_values[0].value, 'a');
	assert.equal(n.child_values[1].value, 'b');
	assert.equal(n.child_values[2].value, 'c');

	for (const child of n.child_values) {
		assert.ok(child.innerHTML.includes(`span data-id="value"`));
	}

	assert.equal(
		n.innerHTML.trim().replace(/\s+/g, ' '),
		`<div data-id="child_values" data-collection="t:c"><t:c class="">
			<span data-id="value" data-property="innerHTML">a</span>
		</t:c><t:c class="">
			<span data-id="value" data-property="innerHTML">b</span>
		</t:c><t:c class="">
			<span data-id="value" data-property="innerHTML">c</span>
		</t:c></div>`.replace(/\s+/g, ' ')
	)
});

QUnit.test("DomClass attaches nested constructed nodes on existing markup", function(assert) {
	const Outer = DomClass("<t:outer>outer html<div data-id='inner'></div></t:outer>");
	const Inner = DomClass("<t:inner>inner html</t:inner>");

	fixture.innerHTML = "<t:outer><t:inner data-id='inner'></t:inner></t:outer>";
	bless(fixture);

	assert.ok(fixture.innerHTML.match(/outer html/), "t:outer was bound");
	assert.ok(fixture.innerHTML.match(/inner html/), "t:inner was bound");
});

QUnit.test("DomClass gracefully ignores non-ID'd params", function(assert) {
	const Widget = DomClass("<t:widget><b data-id='x'>default</b></t:widget>");

	// note the widget has spaces / text nodes in it
	fixture.innerHTML = "<t:widget> <b data-id='x'>value</b> </t:widget>";
	bless(fixture);

	assert.ok(true, "things didn't blow up!");
});

QUnit.test("DomClass supports 3 layers of DomClass nesting", function(assert) {
	fixture.innerHTML = "<t:a></t:a>";
	DomClass("<t:a>a html <t:b></t:b></t:a>");
	DomClass("<t:b>b html <t:c></t:c></t:b>");
	DomClass("<t:c>c html</t:c>");

	assert.ok(fixture.innerHTML.match(/a html/), "t:a was bound");
	assert.ok(fixture.innerHTML.match(/b html/), "t:b was bound");
	assert.ok(fixture.innerHTML.match(/c html/), "t:c was bound");
});

// TODO: seems redundant ... did we test this independently above already
QUnit.test("A basic `DomClass` can be newed up.", function(assert) {
	var C = DomClass("<t:newable>inner html</t:newable>");
	fixture.appendChild(new C());
	assert.ok(fixture.innerHTML.match(/inner html/), "inner markup was preserved");
});

// TODO: redundant?
QUnit.test("A `DomClass` can be newed up, preserving inner tags.", function(assert) {
	var C = DomClass("<t:newable>inner <b>BOLD</b></t:newable>");
	fixture.appendChild(new C());
	assert.ok(fixture.innerHTML.match(/inner <b>BOLD<\/b>/), "inner markup was preserved");
});

QUnit.test("A `DomClass` can be newed up, preserving inner identified tags.", function(assert) {
	var C = DomClass("<t:newable>inner <span data-id='bolded'>identified</span></t:newable>");
	fixture.appendChild(new C());
	assert.ok(fixture.innerHTML.match(/inner/), "inner markup was preserved");
	assert.ok(fixture.innerHTML.match(/identified/), "inner markup was preserved");
	assert.equal(fixture.firstChild.bolded.innerHTML, 'identified');
});

QUnit.test("A `DomClass` with a nested `DomClass` can be newed up.", function(assert) {
	DomClass("<t:innernewable>very inner html</t:innernewable>");
	var C = DomClass("<t:outernewable>outer <t:innernewable></t:innernewable></t:outernewable>");
	fixture.appendChild(new C());
	assert.ok(fixture.innerHTML.match(/outer/), "inner markup was preserved");
	assert.ok(fixture.innerHTML.match(/very inner html/), "inner markup was preserved");
});
