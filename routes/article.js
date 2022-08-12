const { ObjectID } = require("bson");

//when user sends a get reuest by inserting article link to view that article
exports.show = (req, res, next) => {

    //if user doesn't enter the article slug
    if (!req.params.slug) {
        return next(new Error('No article slug.'));
    }
    req.collections.articles.findOne({ slug: req.params.slug }, (error, article) => {
        if (error) {
            return next(error);
        }

        //if the article is not published
        if (!article.published) {
            return res.status(401).send();
        }
        res.render("article", article);
    });
}


// exports.show = async(req, res, next) => {

//     //if user doesn't enter the article slug
//     if (!req.params.slug) {
//         return next(new Error('No article slug.'));
//     }

//     try{
//         article = await req.collections.articles.findOne({ slug: req.params.slug });
//     }
//     catch(error){
//         return next(error);
//     }
//     //if the article is not published
//     if (!article.published) {
//         return res.status(401).send();
//     }

//     res.render("article", article);
// }


//when admin sends get request to view all the articles
exports.list = (req, res, next) => {
    req.collections.articles.find().toArray((error, articles) => {
        if (error) return next(error);
        res.send({ articles: articles });
    });
}

// exports.list = async(req, res, next) => {
//     try
//         articles = await req.collections.articles.find().toArray(); 
//     catch(error)
//         return next(error);
//     res.send({ articles: articles });
// }

//when admin sends post request to articles page
exports.add = (req, res, next) => {
    if (!req.body.article) {
        return next(new Error("No articles exist"));
    }
    let article = req.body.article;
    article.published = false;
    req.collections.articles.insertOne(article, (error, articleResponse) => {
        if (error) {
            return next(error);
        }
        res.send(articleResponse);
    });
}

// exports.add = async(req, res, next) => {
//     if (!req.body.article) {
//         return next(new Error("No articles exist"));
//     }
//     let article = req.body.article;
//     article.published = false;
//     try
//         articleResponse =  await req.collections.articles.insertOne(article);
//     catch(error)
//         return next(error);
//     res.send(articleResponse);
// }

exports.edit = (req, res, next) => {
    if (!req.params.id) {
        return next(new Error('No article ID.'));
    }
    let id = req.params.id.toString();
    req.collections.articles.updateOne({_id: ObjectID(id)}, { $set: req.body.article }, (error, count) => {
        if (error) return next(error);
        res.send({ affectedCount: count });
    });
}

// exports.edit = async(req, res, next) => {
//     if (!req.params.id) {
//         return next(new Error('No article ID.'));
//     }
//     try
//         count = await req.collections.articles.updateById(req.params.id, { $set: req.body.article });
//     catch
//         return next(error);
//     res.send({ affectedCount: count });
// }

exports.del = (req, res, next) => {
    if (!req.params.id) {
        return next(new Error('No article ID.'));
    }
    let id = req.params.id.toString();
    req.collections.articles.deleteOne({_id: ObjectID(id)}, (error, count) => {
        if (error) return next(error);
        res.send({ affectedCount: count });
    });
}

// exports.del = async(req, res, next) => {
//     if (!req.params.id) {
//         return next(new Error('No article ID.'));
//     }

//     try
//         count = await req.collections.articles.removeById(req.params.id);
//     catch(error)
//         return next(error);

//     res.send({ affectedCount: count });
// }

//when someone wants to publish an article, they see the post page through the get request
exports.post = (req, res, next) => {
    if (!req.body.title) {
        res.render('post', { admin: res.locals.admin });
    }
}

//when someone presses the submit/publish button on post page, it redirects here
exports.postArticle = (req, res, next) => {
    if (!req.body.title || !req.body.slug || !req.body.text) {
        return res.render('post', { error: 'Fill title, slug and text.' })
    }
    const article = {
        title: req.body.title,
        slug: req.body.slug,
        text: req.body.text,
        published: false
    };
    req.collections.articles.insertOne(article, (error, articleResponse) => {
        if (error) return next(error);
        res.render('post', { error: 'Article was added. Publish it on Admin page.' });
    });
}


// exports.postArticle = async(req, res, next)=>{
//     if(!req.body.title || !req.body.slug || !req.body.text){
//         return res.render("post", {error: "Fill title, slug and text."});
//     }
//     const article = {
//         title: req.body.title,
//         slug: req.body.slug,
//         text: req.body.text
//         published: false
//     };

//     try
//         articleResponse = await(req.collections.articles.insertOne(article))
//     catch(error)
//         return next(error)
    
//     res.render("post", {error: "Article was added. Publish it on admin page."});
// }

exports.admin = (req, res, next) => {
    req.collections.articles.find({}, { sort: { _id: -1 } }).toArray((error, articles) => {
            if (error) return next(error);
            res.render('admin', { articles: articles, admin: res.locals.admin });
        });
}

// exports.admin = async(req, res, next) => {
//     try
//         articles = await req.collections.articles.find({}, { sort: { _id: -1 } }).toArray();
//     catch(error)
//         return next(error);
//     res.render('admin', { articles: articles });
// }