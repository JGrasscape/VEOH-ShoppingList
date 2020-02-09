const express = require('express');
const PORT = process.env.PORT || 8080;
const body_parser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');

// Controllers
const auth_controller = require('./controllers/auth_controller');
const sl_controller = require('./controllers/sl_controller');

let app = express();

app.use(body_parser.urlencoded({
    extended: true
}));

app.use(session({
    secret: '#!ZZzz..20',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000000
    }
}));

app.use('/css', express.static('css'))

app.use((req, res, next) => {
    console.log('PATH: ' + req.path + " METHOD: " + req.method);
    next();
});

const is_logged_handler = (req, res, next) => {
    // Ei kirjautunutta käyttäjää
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// Auth
app.use(auth_controller.handle_user);
app.get('/login', auth_controller.get_login);
app.post('/logout', auth_controller.post_logout);
app.post('/login', auth_controller.post_login);
app.post('/register', auth_controller.post_register);

// Shoppinglists
app.get('/', is_logged_handler, sl_controller.get_sls);
app.get('/sl/:id', is_logged_handler, sl_controller.get_sl);
app.post('/sl/plus_item', is_logged_handler, sl_controller.post_plus_item);
app.post('/sl/minus_item', is_logged_handler, sl_controller.post_minus_item);
app.post('/add-item/:id', is_logged_handler, sl_controller.post_add_item);
app.post('/add-sl', is_logged_handler, sl_controller.post_add_sl);
app.post('/delete_sl', is_logged_handler, sl_controller.post_delete_sl);
app.post('/sl/delete_item', is_logged_handler, sl_controller.post_delete_item);

// Mikäli annettua sivua ei löydy
app.use((req, res, next) => {
    console.log('404');
    res.write(`
        <html>
        <head><title>ShoppingList - 404</title></head>
        <body>
            <h1>404 - page not found</h1>
        </body>
        </html>
        `);
    res.status(404);    
    res.end();
});

// Yhteys tietokantaan ja serverin käynnistys
const mongoose_url = 'mongodb+srv://list_user:MeoE1whZ6x4lzkav@cluster0-y481a.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(mongoose_url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    console.log('Mongoose connected');
    console.log('Starting Express server');
    app.listen(PORT);
});
