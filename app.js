const express = require('express');
const PORT = process.env.PORT || 8080;
const body_parser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema käyttäjälle, koostuu käyttäjän nimestä,
// listasta ostoslistoja joka taaseen koostuu listasta itemeitä
const user_schema = new Schema({
    name: { type: String, required: true },
    shoppingLists: [{
        name: String,
        items: [{
            name: String,
            count: Number
        }]
    }]
});
const user_model = mongoose.model('user', user_schema);

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

app.use((req, res, next) => {
    console.log('PATH: ' + req.path);
    next();
});

const is_logged_handler = (req, res, next) => {
    // Ei kirjautunutta käyttäjää
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};



// Pääsivu käyttäjälle, joka on kirjautunut sisään
app.get('/', is_logged_handler, (req, res, next) => {
    const user = req.session.user;
    
    // Haetaan  tietokannasta käyttäjän ostoslistat
    const shoppingLists = [];
    user_model.findOne({name: `${user.name}`}).exec(function (err, user_query){
        user_query.shoppingLists.forEach(element => shoppingLists.push(element));
        console.log(shoppingLists);
    });    

    res.write(`
        <html>
        <body>
            <h1>ShoppingList</h1>
            <h2>Shoppinglists for user: ${user.name}</h2>`);
    
    console.log(shoppingLists);
    shoppingLists.forEach(element => {
        res.write(`
        ${element.name}<br>
        `);
        console.log(element.name);
    });
    
    res.write(`
            <hr/>
            <form action="/logout" method="POST">
                <button type="submit">Log out</button>
            </form>
            <footer>&copy; Janne Ruohoniemi</footer>
        </body>
        </html>
    `);
    res.end();
});

// Pääsivu käyttäjälle, joka ei ole kirjautunut sisään
app.get('/login', (req, res, next) => {
    console.log('user:', req.session.user);
    res.write(`
        <html>
        <body>
            <h1>ShoppingList</h1>
            Please login or register a new username.

            <form action="/login" method="POST">
                <h2>Existing users:</h2>
                <input type="text" name="user_name" placeholder="Username">
                <button type="submit">Log in</button>
            </form>
            <hr/>
            <form action="/register" method="POST">
                <h2>New users:</h2>
                <input type="text" name="user_name" placeholder="Username">
                <button type="submit">Register</button>
            </form>
            <hr/>
            <footer>&copy; Janne Ruohoniemi</footer>
        </body>
        </html>
    `);
    res.end();
});

// Kirjaudutaan sisään. Tutkitaan, löytyykö käyttäjä tietokannasta.
app.post('/login', (req, res, next) => {
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
});

// Rekisteröidään uusi käyttäjä, mikäli tätä ei ole ennestään tietokannassa.
app.post('/register', (req, res, next) => {
    const user_name = req.body.user_name;
    // Etsitään käyttäjää MongoDB:stä
    user_model.findOne({
        name: user_name
    }).then((user) => {
        if (user) {
            console.log('User name already registered');
            return res.redirect('/login');
        }

        let new_user = new user_model({
            name: user_name,
            shoppingLists: [{
                name: 'Testilista',
                items: [{
                    name: 'Testi item',
                    count: 1
                }]
            }]
        });

        new_user.save().then(() => {
            return res.redirect('/login');
        });
    });
});

// Mikäli annettua sivua ei löydy
app.use((req, res, next) => {
    console.log('404');
    res.status(404);
    res.send('404');
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
