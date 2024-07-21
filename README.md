A bare bones component style JavaScript framework.

## Install it

```
yarn add wirejs-dom
```

## Use it

Detailed documentation is pending. Until then, here's the gist of it:

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

---

## A New API is Coming Soon ...

The new typed API is based on template literals.

```ts
// Import the /v2 API
import { html, id, span, attribute } from 'wirejs-dom/v2';

// Create HTML Elements using the html template literal tag
const element: HTMLElement = html`<div>
	<b>IMPORTANT!</b> Markup should contain a single "container" node.
	It's a DIV in this case.
</div>`;
```

Elements within the markup can be indexed by adding an `id()` handle:

```ts
const element = html`<div>
	<h3 ${id('title')}>some title</h3>
	<p>some content</p>
</div>`;
```

Now, the `element.data.title` property refers to the `H3`.

Element attributes can be indexed with the `attribute()` handle:

```ts
const element = html`<div>
	<h3 ${id('title')}>some title</h3>
	<p title=${attribute('paragraphClass')}>some content</p>
</div>`;
```

`element.data.paragraphClass` now refers to the `title` attribute of
the `P` tag. It can be read to and written from as a `string`.

Text can be inserted into nodes using the `span()` function:

```ts
const element = html`<div>
	<h3 ${id('title')}>some title</h3>
	<p>Hi there, ${span('name')}.</p>
	<p title=${attribute('paragraphClass')}>some content</p>
</div>`;
```

The `element.data.name` property in an accessor for the `innerHTML` of a
`SPAN` in the new first paragraph.

Both `span` and `attribute` can accept a second parameter with initial values.

#### In progress

1. A `div()` function for creating `DIV`'s similar to the the `span()` function.
1. A `node()` function to create a named accessor for `HTMLElement`'s.
1. A mechanism to link multiple elements and/or attribute values together.
1. A mechanism (or two) to assign styles to nodes easily.