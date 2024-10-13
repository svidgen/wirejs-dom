# Managing garbage collection in `wirejs-dom`

I'm writing this to help myself visually map out and track what bits of the framework could end up holding *other* bits, either created directly by the framework or by userland code, in memory &mdash; or worse &mdash; triggering repeated updates to nodes that are neither in the DOM *nor ever will be again*.

The particular case where this is a concern is in managing event callbacks. Two types of callbacks come to mind. The most concerning of these are the callbacks we create for notifying components (or listeners thereof) when those components are added to or removed from the DOM.

## Firstly, Here's What We Know

Whenever objects become "unreachable" from the global scope, they can be cleaned up. *That's basically it.* This is done using a "mark and sweep" alogrithm. Unlike reference counting approaches, this organically removes cycles by starting from the global scope, finding all reachable objects, marking them as "reachable", and recursing. when this is done, any objects that haven't been reached are garbage collected. (See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management#mark-and-sweep_algorithm).)

So, in one of the simplest base cases, we might have a node with a handler that refers to the node itself. This forms a cycle. Reference counting garbage collectors don't organically know how to bust these cycles.

```mermaid
graph
    subgraph A Simple Cycle
        n1(DOM Node)
        handler(handler)
        n1 -- has --> handler
        handler -- refers to --> n1
    end
```

However, the mark and sweep algorithm used by all modern JavaScript engines knows to destroy these objects when all *other* references to both `DOM Node` and `handler` are eliminated. Put another way, if nothing from the global scope points to these objects (directly or indirectly), they're "unreachble".

This cannot be cleaned up:

```mermaid
graph LR
    subgraph Globals
        dom{{"DOM"}}
    end
    
    subgraph Cycle
        n1(DOM Node)
        handler(handler)
        n1 -- has --> handler
        handler -- refers to --> n1
    end
    
    dom -- contains --> n1
```

This also cannot be cleaned up:

```mermaid
graph LR
    subgraph Cycle
        n1(DOM Node)
        handler(handler)
        n1 -- has --> handler
        handler -- refers to --> n1
    end
    
    subgraph Globals
        var{{"window.handlers[n]"}}
    end

    var -- refers to --> handler
```

This can be.

```mermaid
graph LR
    subgraph Cycle
        n1(DOM Node)
        handler(handler)
        n1 -- has --> handler
        handler -- refers to --> n1
    end
    
    subgraph Globals
        dom{{DOM}}
        var{{"window.handlers[]"}}
    end
    
    Globals -. nothing .-> Cycle
```

We can also use "weak" collections and references to refer to items *from the global scope* without retaining the objects in memory.

```js
function getSomething() {
    const item = {...};
    return new WeakRef(item);
}

window.something = getSomething();
```

Now, although the global `something` property refers to `item` from the `getSomething()` closure, it's a weakly held reference. Users of the global scope must first check to see if the reference still exists before using it &mdash; and in our trivial example, the `item` is likely to disappear very quickly because *nothing else* can access it.

```mermaid
graph LR
    subgraph Globals
        something
    end
    
    subgraph Weak Refs
        ref{{item ref}}
    end
    
    subgraph Closure
        item
    end
    
    something -- refers to --> ref
    ref -. weakly refers to .-> item
```

When the garbage collector performs its sweep, it traverses from `something` to `item ref` and *stops*. It does not traverse down to `item`. It is considered "unreachable" from the global scope and is liable for garbage collection.

## Now, the Individual Cases

### Case 1 - Event Callbacks

For example:

```ts
const view = html`<div>
    <h3>${text('title', 'unknown title')}</h3>
    <form onsubmit=${event => {
        event.preventDefault();
        view.title = view.newTitle;
        view.newTitle = '';
    }}>
        <p>Set a new title:</p>
        <input type='text' value=${attribute('newTitle')} />
        <input type='submit' value='set' />
    </form>
</div>`;
```


 
### DOM `onadd` and `onremove`


### Other Remote Concerns

The only other area that comes to mind are "components containing other components". However, this *shouldn't* be much of a concern. We don't do anything special here. But, prior to launching for real, it might be worth mapping these out as well. E.g., when a `text()` node or a `list()` node are created, does anything get dropped into global scope that keeps these things alive? Are common patterns customers might employ that would be harmful?

