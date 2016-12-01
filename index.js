var fs = require('fs');
var xml2js = require('xml2js');
var async = require('async');

var wp2js = module.exports = {};
var posts = [];

// Check if an object is a plain object, rather than an array.
function isPlainObject(o) {
    return Object.prototype.toString.call(o) == '[object Object]';
}

// Copy the properties of the `o2` to `o1`.(Deeply optionally)
function extend(o1, o2, isDeep){
    for (var p in o2) {
        if (o2.hasOwnProperty(p)) {
            if (!isDeep) {
                o1[p] = o2[p];
            } else if (!isPlainObject(o2[p])) {
                o1[p] = o2[p];
            } else {
                o1[p] = extend(o1[p], o2[p], true);
            }
        }
    }
    return o1;
};

// By `props`, filter the properties of the object as the element in the array `objArr`.
// And return an array consisting of  the filtered object
function propFilter(objArr, props) {
    if (!Array.isArray(objArr)) {
        objArr = [objArr];
    }

    if (!props) {
        return objArr;
    }

    if (!Array.isArray(props)) {
        var tmp = props;
        props = [];
        for (var p in tmp) {
            if (tmp.hasOwnProperty(p) && tmp[p]) {
                props.push(p);
            }
        }
    }

    return objArr.map(function(o){
        var ret = {};
        props.forEach(function(p){
            ret[p] = o[p];
        });
        return ret;
    });
}

// The exposed method is used to parse an xml file exported in wordpress to a js object
wp2js.parse = function(opts, callback){
    var defaults = {
        source: '', // The file path
        encoding: 'utf8', // The file encoding
        filterConfig: { // By default, only these properties are included
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
    };

    if (typeof opts == 'string') {
        opts = {
            source: opts
        };
    }

    if (typeof callback != 'function') {
        callback = function(){};
    }

    opts = extend(defaults, opts, true);
    var filterConfig = opts.filterConfig;

    // Main parsing process
    async.waterfall([
        function(next){
            // Read the xml file
            fs.readFile(opts.source, opts.encoding, next);
        },
        function(content, next){
            // Parse the xml file to a javasript object
            xml2js.parseString(content, next);
        },
        function(xml, next){

            // Convert the object in last step to a readable object
            async.parallel([
                function(callback){
                    callback(null, xml.rss.channel[0]['generator'][0]);
                },
                function(callback){
                    callback(null, xml.rss.channel[0]['title'][0]);
                },
                function(callback){
                    callback(null, xml.rss.channel[0]['link'][0]);
                },
                function(callback){
                    callback(null, xml.rss.channel[0]['description'][0]);
                },
                function(callback){
                    callback(null, xml.rss.channel[0]['language'][0]);
                },
                function(callback){
                    callback(null, xml.rss.channel[0]['wp:base_site_url'][0]);
                },
                function(callback){
                    callback(null, xml.rss.channel[0]['wp:base_blog_url'][0]);
                },
                function(callback){
                    async.map(xml.rss.channel[0]['wp:author'], function(v, cb){
                        cb(null, {
                            id: v['wp:author_id'][0],
                            login: v['wp:author_login'][0],
                            email: v['wp:author_email'][0],
                            displayName: v['wp:author_display_name'][0],
                            firstName: v['wp:author_first_name'][0],
                            lastName: v['wp:author_last_name'][0]
                        });
                    }, callback);
                },
                function(callback){
                    async.map(xml.rss.channel[0]['wp:category'], function(v, cb){
                        cb(null, {
                            id: v['wp:term_id'][0],
                            nicename: v['wp:category_nicename'][0],
                            parent: v['wp:category_parent'][0],
                            name: v['wp:cat_name'][0]
                        });
                    }, callback);
                },
                function(callback){
                    async.map(xml.rss.channel[0]['wp:tag'], function(v, cb){
                        cb(null, {
                            id: v['wp:term_id'][0],
                            slug: v['wp:tag_slug'][0],
                            name: v['wp:tag_name'][0]
                        });
                    }, callback);
                },
                function(callback){
                    async.map(xml.rss.channel[0]['item'], function(item, cb){
                        var post = {
                            id: item['wp:post_id'][0],
                            title: item['title'][0],
                            link: item['link'][0],
                            pubDate: item['pubDate'][0],
                            creator: item['dc:creator'][0],
                            guid: item['guid'][0],
                            content: item['content:encoded'][0],
                            excerpt: item['excerpt:encoded'][0],
                            date: item['wp:post_date'][0],
                            GMTDate: item['wp:post_date_gmt'][0],
                            commentStatus: item['wp:comment_status'][0],
                            pingStatus: item['wp:ping_status'][0],
                            name: item['wp:post_name'][0],
                            status: item['wp:status'][0],
                            parent: item['wp:post_parent'][0],
                            menuOrder: item['wp:menu_order'][0],
                            type: item['wp:post_type'][0],
                            password: item['wp:post_password'][0],
                            isSticky: item['wp:is_sticky'][0],
                            attachmentUrl: item['wp:attachment_url'] && item['wp:attachment_url'][0],
                            categories: [],
                            tags: [],
                            comments: [],
                            postmetas: []
                        };
                        
                        item['category'] && item['category'].forEach(function(cat){
                            if (cat.$.domain == 'category') {
                                post.categories.push({
                                    nicename: cat.$.nicename,
                                    name: cat._
                                });
                            } else if (cat.$.domain == 'post_tag') {
                                post.tags.push({
                                    slug: cat.$.nicename,
                                    name: cat._
                                });
                            }
                        });

                        item['wp:postmeta'] && item['wp:postmeta'].forEach(function(postmeta){
                            post.postmetas.push({
                                key: postmeta['wp:meta_key'][0],
                                value: postmeta['wp:meta_value'][0]
                            });
                        });

                        item['wp:comment'] && item['wp:comment'].forEach(function(cmt){
                            post.comments.push({
                                id: cmt['wp:comment_id'][0],
                                author: cmt['wp:comment_author'][0],
                                email: cmt['wp:comment_author_email'][0],
                                url: cmt['wp:comment_author_url'][0],
                                ip: cmt['wp:comment_author_IP'][0],
                                date: cmt['wp:comment_date'][0],
                                GMTDate: cmt['wp:comment_date_gmt'][0],
                                content: cmt['wp:comment_content'][0],
                                approved: cmt['wp:comment_approved'][0],
                                parent: cmt['wp:comment_parent'][0],
                                userId: cmt['wp:comment_user_id'][0]
                            });
                        });
                        if (post.type === 'post') {
                          posts.push(post);
                        }
                        cb(null, post);
                    }, callback);
                }
            ], next);
        }
    ], function(err, result){
        if (err) callback(err);

        var retProps = [
            'generator',
            'title',
            'link',
            'description',
            'language',
            'siteUrl',
            'blogUrl',
            'authors',
            'categories',
            'tags'
        ];

        // The result object
        var ret = {};

        retProps.forEach(function(v, i){
            ret[v] = result[i];
        });

        ret.posts = ret.pages = ret.attachments = [];

        // Filter the different post type
        result[8].forEach(function(v){
            switch(v.type) {
                case 'post':
                    ret.posts.push(v);
                    break;
                case 'page':
                    ret.pages.push(v);
                    break;
                case 'attachment':
                    ret.attachments.push(v);
                    break;
            }
        });

        // Filter the properties
        if (filterConfig !== 'full') {
            if (isPlainObject(filterConfig)) {
                Object.keys(filterConfig).forEach(function(v){
                    ret[v] = propFilter(ret[v], filterConfig[v]);
                });
            } else if (Array.isArray(filterConfig)) {
                ret = propFilter(ret, filterConfig)[0];
            }
        }
        ret['posts'] = posts;
        callback(null, ret);
    });
};
