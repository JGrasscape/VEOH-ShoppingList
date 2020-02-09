const user_model = require('../models/user_model');
const auth_views = require('../views/auth_views');

// Haetaan käyttäjän tietokantaobjekti
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

// Login-näkymä, jos käyttäjä ei ole vielä kirjautunut sisään
const get_login = (req, res, next) => {
    res.send(auth_views.login_view());
};

// Uloskirjautuminen
const post_logout = (req, res, next) => {
    req.session.destroy();
    res.redirect('/login');
};

// Kirjaudutaan sisään. Tutkitaan, löytyykö käyttäjä tietokannasta.
const post_login = (req, res, next) => {
    const user_name = req.body.user_name;
    // Etsitään käyttäjää MongoDB:stä
    user_model.findOne({
        name: user_name
    }).then((user) => {
        if (user) {
            req.session.user = user;
            return res.redirect('/');
        }
        res.redirect('/login');
    });
};

// Rekisteröidään uusi käyttäjä, mikäli tätä ei ole ennestään tietokannassa.
const post_register = (req, res, next) => {
    const user_name = req.body.user_name;
    // Etsitään käyttäjää MongoDB:stä
    user_model.findOne({
        name: user_name
    }).then((user) => {
        if (user) {
            return res.redirect('/login');
        }

        let new_user = new user_model({
            name: user_name,
            shoppingLists: []
        });

        new_user.save().then(() => {
            return res.redirect('/login');
        });
    });
};

module.exports.handle_user = handle_user;
module.exports.get_login = get_login;
module.exports.post_logout = post_logout;
module.exports.post_login = post_login;
module.exports.post_register = post_register;