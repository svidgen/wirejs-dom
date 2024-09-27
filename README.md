A bare bones component style JavaScript framework.

## Install it

```
yarn add wirejs-dom
```

Or

```
npm install wirejs-dom
```

## Use it

~~Detailed documentation is pending. Until then, here's the gist of it:~~

I am no longer working on detailed documentation for the V1 experience. I am instead working aggressively on the V2 experience. This is sort of what V1 looks like.

```js
const { DomClass } = require('wirejs-dom');

const template = `<myns:post>
	<h3 data-id='title'></h3>
	<p data-id='body'></p> 
	<p data-id='comments'></p>
</myns:post>`;

DomClass(template, () => {
	const self = this;
	MyAPI.fetchComments(this.id).then(comments => {
		// assuming we've also defined a Comment DomClass ...
		self.comments = comments.map(c => new Comment(c));
	});
});
```

But, more importantly, buckle up for V2. It's going to be *neat*.

---

## V2 Preview

The new typed API is based on tagged template literals. It *inverts* the way you might normally think of front-end frameworks and their "hook" mechanisms. Many JS frameworks ask you to create hooks with a `signal` interface that you then inject into JSX. The JSX is typically then re-rendered whenever the signal fires.

`wirejs` works *mostly* in the opposite direction. You write streamlined HTML that emits direct accessors. You can then read or write to the accessor. The DOM node or property you write is then updated *directly*.

There is no component-level re-render unless *you* re-render it.

You'll see what I mean. It's actually really simple. Let's take a look.

### The Basics

Import the stuff.

```ts
// While this API is still in preview, import from /v2.
import { html, id, text, attribute, list } from 'wirejs-dom/v2';
```

Use the `html` tag to create an [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement).

```ts
const note = html`<div>
	<b>IMPORTANT!</b> Markup in an "html string" must have a single "container" node.
	It's a DIV in this case. The container DIV is what is returned.
	<br /><br />
	But, you can use whatever tag you like. You could even make one up.
</div>`;
```

Add the resulting [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) to the DOM ***or*** interpolate it in another `html` tag.

```ts
document.body.appendChild(html`
	<div>
		<h1>A Title</h1>
		${note}
		<div>the rest of the app...</div>
	</div>
`);
```

You can get pretty far with this little building block alone. But, `wirejs` is a little more dynamic and magical than that.

### Accessors and the `data` property

When you create an `html` element with `wirejs`, it also builds up a typed `data` property from the elements you create with `wirjes` "accessors". Those accessors are:

- `text(key: string, value?: string)`<br />Create a [`Text`](https://developer.mozilla.org/en-US/docs/Web/API/Text) node.
- `id(key: string)`<br />The contextual `HTMLElement`.
- `attribute(key: string, value?: string)`<br />The contextual [`Attr`](https://developer.mozilla.org/en-US/docs/Web/API/Attr).
- `list<T>(key: string, value?: T[], map?: ((item: T) => HTMLElement))`<br />A mapped list. Default map creates `div` elements.
- `list<T>(key: string, map?: ((item: T) => HTMLElement), value?: T[])`<br />A mapped list, alternative parameter ordering.

Each accessor receives a `key` parameter. The `key` parameter shows up in the `data` property of the `HTMLElement` created by your `html` tag.

Let's see how they work in more detail.

### The `text()` Accessor

This creates a [`Text`](https://developer.mozilla.org/en-US/docs/Web/API/Text) node and adds it to the `data` property of your element.

```ts
const element = html`<div>
	Hello ${text('name', 'world')}.
</div>`;
```

Initially, this will produce the following an element with the following markup:

```html
<div>
	Hello, world.
</div>
```

The interpolated `text('name', 'world')` call allows you to both read and write the `name` property like this:

```ts
// This logs "world"
console.log(element.data.name);

// This updates the HTMLElement directly
element.data.name = "Jon";
```

After setting the `name` property, the element is immediately updated and its HTML will look like this:

```html
<div>
	Hello, Jon.
</div>
```

### The `id()` Accessor

The `id()` accessor exposes `data` properties to access or replace DOM elements directly.

```ts
const element = html`<div>
	<h3 ${id('title')}>some title</h3>
	<p>some content</p>
</div>`;
```

This produces an element with the following markup:

```html
<div>
	<h3>some title</h3>
	<p>some content</p>
</div>
```

The `element.data.title` property refers to the `H3` element itself. If you replace it with with another HTMLElement (or `Text` node) the element is dropped directly into the DOM in its place.

```ts
element.data.title = html`<h4>A less important title ... </h4>`;
```

The updated markup would look like this:

```html
<div>
	<h4>A less important title ... </h4>
	<p>some content</p>
</div>
```

And after the swap, the new `H4` element is now accessible and overwritable via the `title` property. Because the accessor also refers to the element itself, you can also directly manage its native properties &mdash; to add events, for example.

```ts
element.data.title.onclick = () => alert('You clicked the title!');
```

The markup itself will not be updated to reflect this. But, the DOM node will now have the `onclick` event registered. Clicking the `H4` will now result in an alert.

### The `attribute()` Accessor

The `attribute()` accessor provides a shortcut to expose individual element attributes.

```ts
const element = html`<div>
	<h3 ${id('title')}>some title</h3>
	<img src=${attribute('logo', 'optional/default.png')} />
</div>`;
```

This produces the following markup:

```html
<div>
	<h3>some title</h3>
	<img src='optional/default.png' />
</div>
```

If you write to the `logo` property, it will update the DOM accordingly.

```ts
element.data.logo = 'special-logo.png';
```

The updated markup will look like this:

```html
<div>
	<h3>some title</h3>
	<img src='special-logo.png' />
</div>
```

### The `list()` Accessor

The `list()` accessor provides access to a list of items with optional mapping between *writing* and *rendering* in the DOM. You can do anything you can normally do to an `Array` to an exposed `list` accessor and the changes will be remapped *as-needed* and *re-inserted* into the DOM.

```ts
const element = html`<div>
	People I know.
	${list('names', ['Janet', 'Joseph', 'Jimmy John'])}
</div>`;
```

By default, `list()` renders items inside `<div>` elements. So, the resulting markup will be *similar* to this (spacing added here for readability):

```html
<div>
	People I know.
	<div>Janet</div>
	<div>Joseph</div>
	<div>Jimmy John</div>
</div>
```

I can update individual list items using the `names` property:

```ts
element.data.names[1] = 'Joseph (Who goes by Joe)';
```

The `HTMLElement` associated with the 2nd item of the list will be updated directly, and the markup will look like this:

```html
<div>
	People I know.
	<div>Janet</div>
	<div>Joseph (Who goes by Joe)</div>
	<div>Jimmy John</div>
</div>
```

I could `sort()` and `reverse()` the list:

```ts
element.data.names.sort().reverse();
```

The updated markup:

```html
<div>
	People I know.
	<div>Joseph (Who goes by Joe)</div>
	<div>Jimmy John</div>
	<div>Janet</div>
</div>
```

(You can also `push()`, `pop()`, `shift()`, `unshift()`, `slice()`, and `splice()`.)

You can also replace a list wholesale.

```ts
element.data.names = ['Tony Stark', 'Bruce Banner', 'Stephen Strange'];
```

The updated markup:

```html
<div>
	People I know.
	<div>Tony Stark</div>
	<div>Bruce Banner</div>
	<div>Stephen Strange</div>
</div>
```

If you don't like `div`'s, you can map your data however you like:

```ts
const element = html`<div>
	People I know.
	<ol>${list('names',
		['Tony Stark', 'Bruce Banner', 'Stephen Strange'],
		(name: string) => html`<li>${name}</li>`
	)}</ol>
</div>`;
```

This will produce markup like this:

```html
<div>
	People I know.
	<ol>
		<li>Tony Stark</li>
		<li>Bruce Banner</li>
		<li>Stephen Strange</li>
	</ol>
</div>
```

When you read the accessor, it will still look like a list of *strings*.

You can also omit the initial list data to be set later.

```ts
const element = html`<div>
	People I know.
	<ol>${list('names', (name: string) => html`<li>${name}</li>`)}</ol>
</div>`;
```

Your initial markup will look like this:

```html
<div>
	People I know.
	<ol><!-- Your items will show up here when you write them. --></ol>
</div>
```

---

### Notice!

**1. Setting a `list()` from an `Array` creates a *copy* of the original.** Updates to the original `Array` do not update the DOM.

```ts
const names = ['Tony Stark', 'Bruce Banner', 'Stephen Strange'];
element.data.names = names;

// This doesn't do anything to `element.data.names`.
names.push('The Other Steve');
```

**2. `list()` uses an empty `Text` node to keep its place.** This is true regardless of whether there are items in the list. The empty node just tracks where the list starts and makes it simpler and faster for `wirejs` to rebuild the list in the DOM as necessary.

```html
<div>
	People I know.
	<ol><!-- An empty Text node lives here. (Don't remove it!) --></ol>
</div>
```

---

### Event Handlers

You have two options for event handlers.

1. **Use `attribute()` accessors.**<br />Good for event handlers you may need to overwrite later.
2. **Inline handlers.**<br />Good for all the other times.

Here's what an inline handler might look like:

```ts
const element = html`<div>
	Hello, ${text('name', 'world')}.
	( <button onclick=${() => element.data.name = 'Jon'}>Rename</button> )
</div>`;
```

The first parameter for inline handlers is the `Event` that triggered them, just like a normal event handler. And, as shown in the example, closures come along for the ride. This allows you to write some pretty self-contained components.

```ts
const app = html`<div>
	<h2>My Todo App</h2>
	<ol>${list('todos', (todo) => html`<li>
		${todo.text}
		(<b style='cursor: pointer'
			onclick=${() => app.data.todos = [...app.data.todos]
			.filter(item => item !== todo)
		}>Done</b>)
	</li>`)}</ol>
	<form onsubmit=${event => {
		event.preventDefault();
		app.data.todos.push({ text: app.data.newTodo });
		app.data.newTodo = '';
	}}>
		<input type='text' value=${attribute('newTodo', '')} />
		<button type='submit'>Add</button>
	</form>
</div>`;
document.body.appendChild(app);
```

This is not alawys recommended. But, it's great for smaller, inlined, or otherwise self-contained components. It can often save on some of the maintenance overhead of creating a bigger or more complex component.

## High Level Backlog

(In no particular order.)

1. A good rehydration mechanism
1. SSR+SSG with rehydration support

This is not a comprehensive list of things I'm aiming at &mdash; just want to be clear that these things *are* pretty high on my list!