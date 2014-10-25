wp2js
=====

Parse the XML file exported in wordpress to a readable javascript object. The properties of the object can be filtered.

Installation
------------

Install `wp2js` is easy, just use [npm](http://npmjs.org/). Then execute the below command:

```js
npm install wp2js
```

Usage
-----

It is simple to use it, just like this:

```js
var wp2js = require('wp2js');

wp2js.parse('wordpress.data.xml', function(err, data){
    /**
     * By default, the structure of the `data` object is like the below:
     *  {
     *      generator: 'http://wordpress.org/?v=3.8.4',
     *      title: 'Alex Chao',
     *      link: 'http://www.xiaocaoge.com',
     *      description: 'A frontend',
     *      language: 'zh-CN',
     *      siteUrl: 'http://www.xiaocaoge.com',
     *      blogUrl: 'http://www.xiaocaoge.com',
     *      authors: [Object],
     *      categories: [Object],
     *      tags: [Object],
     *      posts: [Object],
     *      pages: [Object],
     *      attachments: [Object]
     *  }
    */
    // ...
});
```
> **Note**: The property name is shorten, such as `wp:base_site_url` >> `siteUrl`, `wp:post_id` >> `id`, `content:encoded` >> `content`, etc.

Or you can pass a configurable object as the first argument:

```js
wp2js.parse({
    source: 'wordpress.data.xml',
    encoding: 'utf8', // The utf8 is default
}, function(err, data){
    // ...
});
```

Or you can filter the properties:

> **Note**: It has a default filter level, see the [#opts](#user-content-opts).

```js
wp2js.parse({
    source: 'wordpress.data.xml',
    // Only the `categories` and `tags` are included in the `data` object
    filterConfig: ['categories', 'tags',]
}, function(err, data){
    // ...
});
```

Or you can filter out some properties of `data`.

```js
wp2js.parse({
    source: 'wordpress.data.xml',
    filterConfig: {
        categories: false,
        tags: false
    }
}, function(err, data){
    // ...
});
```

You can even filter the properties of the object as the element in `categories` or `tags`.

```js
wp2js.parse({
    source: 'wordpress.data.xml',
    filterConfig: {
        categories: ['id', 'name'],
        tags: ['id', 'name']
    }
}, function(err, data){
    // ...
});
```

In the same way, you can filter out some properties of the object as the element in `categories`.

```js
wp2js.parse({
    source: 'wordpress.data.xml',
    filterConfig: {
        categories: {
            parent: false,
            name: false
        }
    }
}, function(err, data){
    // ...
});
```

At last, you can output the full data in the XML file.

```js
wp2js.parse({
    source: 'wordpress.data.xml',
    filterConfig: 'full'
}, function(err, data){
    // ...
});
```

Options
-------

At present, it only provides an asynchronous method - `wp2js.parse(opts, callback)`.

####opts

Type: `Object/String`

If it is a string, then it will be as an XML file path.
If it is an object, then it can include three properties: `source`, `encoding` and `filterConfig`.

The default value of `filterConfig`:

```js
// By default, only these properties and other string properties
// (such as `title', 'description`, `language`) are included.
filterConfig: { 
    authors: {
        id: true,
        login: true,
        email: true,
        displayName: true
    },
    categories: {
        id: true,
        nicename: true,
        parent: true,
        name: true
    },
    tags: {
        id: true,
        slug: true,
        name: true
    },
    posts: {
        id: true,
        name: true,
        title: true,
        date: true,
        GMTdate: true,
        creator: true,
        content: true,
        excerpt: true,
        commentStatus: true,
        status: true,
        categories: true,
        tags: true,
        comments: true
    },
    pages: {
        id: true,
        name: true,
        title: true,
        date: true,
        GMTdate: true,
        creator: true,
        content: true,
        excerpt: true,
        commentStatus: true,
        status: true,
        categories: true,
        tags: true,
        comments: true
    },
    attachments: {
        id: true,
        name: true,
        title: true,
        date: true,
        GMTdate: true,
        creator: true,
        content: true,
        excerpt: true,
        commentStatus: true,
        status: true,
        attachmentUrl: true,
        categories: true,
        tags: true,
        comments: true
    }
}
```

####callback

Type: `Function`

It can accept two arguments - `callback(err, blog)`.
The first argument is about the error information and the second argument is an object about the blog data.

Issues
------

If you come cross a bug or other problems, you can submit an issue in here: [https://github.com/Alex1990/wp2js/issues/](https://github.com/Alex1990/wp2js/issues/)

Release History
---------------

**2014-10-26** `0.1.1`

Fix a type error.

**2014-10-26** `0.1.0`

First version.