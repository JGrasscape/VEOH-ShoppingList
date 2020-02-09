const user_model = require('../models/user_model');
const auth_views = require('../views/auth_views');

const handle_user = (req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    user_model.findById(req.session.user._id).then((user) => {
        req.user = user;
        next();
    }).catch((err) => {
        console.log(err);
        res.redirect('/login');
    });
};

const get_login = (req, res, next) => {
    res.send(auth_views.login_view());
};

module.exports.handle_user = handle_user;
module.exports.get_login = get_login;