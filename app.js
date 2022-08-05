const express = require("express");
const path = require("path");
const http = require("http");
// const cookieParser = require("cookie-parser"); --> don't need this, bc ES automatically handles cookies now
const session = require("express-session");
const { MongoClient } = require("mongodb");

//route files
const indexFile = require("./routes/index");
const articleFile = require("./routes/article");
const userFile = require("./routes/user");


//doing database-y things
const url = "mongodb://localhost:27017";
client = new MongoClient(url);
const dbName = "blog";

let connection = async () => {
    //establishing the connection
    await client.connect();
}

connection().catch();
let db = client.db(dbName);

const collections = {
    articles: db.collection("articles"),
    users: db.collection("users")
}


//app configurations/middleware
let app = express();
app.set("appName", "BlogApp");
app.set("port", 3000);
app.set("views", path.join(__dirname, "templates"));
app.set("view engine", "pug");

app.locals.appTitle = "Express Blog";

//attaches the collections to req obj, so it can be accessed later
app.use((req, res, next) => {
    if (!collections.users || !collections.articles) {
        return next(new Error("Collection Error."));
    }
    req.collections = collections;
    return next();
});

app.use((req, res, next) => {
    if (req.session && req.session.admin) {
        res.locals.admin = true;
    }
    next();
});

app.use("/static", express.static(path.join(__dirname, "static")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//for cookies and sessions
// app.use(cookieParser('3CCC4ACD-6ED1-4844-9217-82131BDCB239'));
app.use(session({ secret: 'sf65165  iuhhibuy67bW#@^##@t rvbf7 ff75f6511348986753t r#@@&#&EGDJH%%#Eh', resave: true, saveUninitialized: true }));

//authentication middlewate
const authorize = (req, res, next) => {
    if (req.session && req.session.admin) {
        return next();
    }
    else {
        return res.sendStatus(401);
    }
}



//routes
app.get('/', indexFile.index);
app.get('/login', userFile.login);
app.post('/login', userFile.authenticate);
app.get('/logout', userFile.logout);
app.get('/admin', authorize, articleFile.admin);
app.get('/post', authorize, articleFile.post);
app.post('/post', authorize, articleFile.postArticle);
app.get('/articles/:slug', articleFile.show);

//for admin page
app.all("/api", authorize);
app.get('/api/articles', articleFile.list);
app.post('/api/articles', articleFile.add);
app.put('/api/articles/:id', articleFile.edit);
app.delete('/api/articles/:id', articleFile.del);

app.get("*", (req, res) => {
    res.sendStatus(404);
});

http.createServer(app).listen(app.get("port"), () => {
    console.log(`The server is running in port ${app.get("port")}`);
});