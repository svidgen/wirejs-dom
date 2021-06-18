# tg-dom

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

And of course we try to keep our tests as straightforward as possible. So, you can always refer to the tests to see how `DomClass` can be used.
