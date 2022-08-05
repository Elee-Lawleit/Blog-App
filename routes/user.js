exports.list = (req, res, next) => {
    res.send("Respond with a resource");
}

exports.login = (req, res, next) => {
    res.render("login");
}

exports.logout = (req, res, next) => {
    req.session.destroy();
    res.redirect('/');
}

// exports.authenticate = (req, res, next) => {
//     if (!req.body.email || !req.body.password) {
//         return res.render("login", { error: "Pleas enter a valid email and password." });
//     }
//     req.collections.users.findOne({ email: req.body.email, password: req.body.password }, (error, user)=>{
//         if (error) {
//             return next(error);
//         }
//         if (!user) {
//             console.log(user);
//             return res.render("login", { error: req.body.email + req.body.password});
//         }

//         req.session.user = user;
//         req.session.admin = user.admin;
//         res.redirect("/admin");
//     });
// }


exports.authenticate = async(req, res, next) => {
    if (!req.body.email || !req.body.password) {
        return res.render("login", { error: "Pleas enter a valid email and password." });
    }
    try{
        var user = await req.collections.users.findOne({ "email": req.body.email, "password": req.body.password});
    }
    catch{
        return next(error);
    }
    if (!user) {
        // console.log(user);
        return res.render("login", { error: "Incorrect email or password!"});
    }
    req.session.user = user;
    req.session.admin = user.admin; //--> user.admin = true
    res.redirect("/admin");
}