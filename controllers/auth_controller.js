const user_model = require('../models/user_model');
const auth_views = require('../views/auth_views');

const get_login = (req, res, next) => {
    res.send(auth_views.login_view());
};

module.exports.get_login = get_login;