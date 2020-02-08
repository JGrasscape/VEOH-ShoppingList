const express = require('express');
const PORT = process.env.PORT || 8080;
const body_parser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
// Schema käyttäjälle, koostuu käyttäjän nimestä,
// listasta ostoslistoja joka taaseen koostuu listasta itemeitä
const user_schema = new Schema({
    name: { type: String, required: true },
    shoppingLists: [{
        name: { type: String, required: true },
        items: [{
            name: { type: String, required: true },
            count: Number
        }]
    }]
});
const user_model = mongoose.model('user', user_schema);
*/

// Schema itemeille
const item_schema = new Schema({
    name: {
        type: String,
        req: true
    },
    count: {
        type: Number,
        req: true
    },
    img: {
        type: String,
        req: false
    }
});
const item_model = mongoose.model('item', item_schema);

// Schema ostoslistoille
const sl_schema = new Schema({
    name: {
        type: String,
        req: true
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'item',
        req: true
    }]
});
const sl_model = mongoose.model('shoppingList', sl_schema);

// Schema käyttäjille
const user_schema = new Schema({
    name: {
        type: String,
        req: true
    },
    shoppingLists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shoppingList',
        req: true
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

// Haetaan käyttäjän tietokanta-objekti
app.use((req, res, next) => {
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
});

// Pääsivu käyttäjälle, joka on kirjautunut sisään
app.get('/', is_logged_handler, (req, res, next) => {
    const user = req.user;
    console.log('käyttäjän', user.name, 'listat');
    /*
    const shoppingLists = [];
    user_model.findOne({name: `${user.name}`}).exec(function (err, user_query){
        user_query.shoppingLists.forEach(element => shoppingLists.push(element));
        console.log(shoppingLists);
    });    
*/
    // Haetaan  tietokannasta käyttäjän ostoslistat
    user.populate('shoppingLists').execPopulate().then(() => {
        res.write(`
        <html>
        <head><title>ShoppingList</title>
        <meta http-equiv="Content-Type", content="text/html;charset=UTF-8">
        <link rel="stylesheet" type="text/css" href="./css/style.css">
        </head> 
        <body>
            <h1>ShoppingList</h1>
            <h2>Shoppinglists for user: ${user.name}</h2>`);

        console.log(user.shoppingLists);
        user.shoppingLists.forEach((sl) => {            
            //res.write(sl.name);
            res.write(`
                <a href="./sl/${sl._id}">${sl.name}</a>               
                <form action="delete_sl" method="POST">
                    <input type="hidden" name="sl_id" value="${sl._id}">
                    <button type="submit">Delete list</button>
                </form>
            `);
        });

        res.write(`
            <hr/>
            <form action="/add-sl" method="POST">
                <input type="text" name="sl">
                <button type="submit">Add a shoppinglist</button>
            </form>
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
});

// Pääsivu käyttäjälle, joka ei ole kirjautunut sisään
app.get('/login', (req, res, next) => {
    console.log('user:', req.session.user);
    res.write(`
        <html>
        <head><title>ShoppingList</title>
        <meta http-equiv="Content-Type", content="text/html;charset=UTF-8">
        <link rel="stylesheet" type="text/css" href="./css/style.css">
        </head>
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

app.get('/sl/:id', (req, res, next) => {
    const sl_id = req.params.id;
    sl_model.findOne({
        _id: sl_id
    }).then((sl) => {
        console.log('ostoslista löytyi')
        sl.populate('items').execPopulate().then(() => {
            res.write(`
                <html>
                <head><title>ShoppingList</title>
                <meta http-equiv="Content-Type", content="text/html;charset=UTF-8">
                <link rel="stylesheet" type="text/css" href="./css/style.css">
                </head> 
                <body>
                    <h1>Shoppinglist: ${sl.name}</h1>
                    <h2>Items:</h2>            
            `);
        
            // Haetaan itemit kannasta
            sl.items.forEach((item) => { 
                console.log('item löytyi', item);
                res.write(`
                    <table>
                        <tr>
                            <th>Item</th>
                            <th>Count</th>
                        </tr>
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.count}</td>
                        </tr>
                    </table>
                `);                                                
            });        

            res.write(`
                    <hr/>
                    <form action="/add-item/${sl._id}" method="POST">
                        <input type="text" name="item" placeholder="item">
                        <input type="number" name="count" placeholder="quantity">
                        <button type="submit">Add an item</button>
                    </form>
                    <hr/>
                    <footer>&copy; Janne Ruohoniemi</footer>
                </body>
                </html>
            `); 

            res.end();
        });
    });
});

app.post('/add-item/:id', (req, res, next) => {
    const sl_id = req.params.id;
    sl_model.findOne({
        _id: sl_id
    }).then((sl) => {
        // Lista löytyi, luodaan item
        console.log('ostoslista löytyi')
        let new_item = item_model({
            name: req.body.item,
            count: req.body.count
        });

        new_item.save().then(() => {
            console.log('item saved');
            // Lisätään viittaus ostoslista-objektin item-listaan
            sl.items.push(new_item);
            sl.save().then(() => {
                console.log('shoppinglist saved');
                return res.redirect(`/sl/${sl._id}`);
            });
        });
    });
});

app.post('/add-sl', (req, res, next) => {
    const user = req.user;

    let new_sl = sl_model({
        name: req.body.sl,
        items: []
    });

    new_sl.save().then(() => {
        console.log('shoppinglist saved');
        // Lisätään viittaus käyttäjäobjektin shoppinglists-listaan
        user.shoppingLists.push(new_sl);
        user.save().then(() => {
            console.log('user saved');
            return res.redirect('/');
        });
    });
});

app.post('/delete_sl', (req, res, next) => {
    const user = req.user;
    const sl_id_to_delete = req.body.sl_id;

    // Poistetaan shoppinglist käyttäjältä
    console.log('Deleting sl from user.');
    const updated_sl = user.shoppingLists.filter((sl_id) => {
        return sl_id != sl_id_to_delete;
    });
    user.shoppingLists = updated_sl;

    user.save().then(() => {
        // Käyttäjä päivitetty, vittaus shoppinglistiin poistettu.
        // Itse lista ja sen itemit ovat vielä olemassa kannassa.
        // Haetaan itemit ja poistetaan.
        console.log('Find and delete sl items.');
        sl_model.findById(sl_id_to_delete).then((sl) => {
            sl.populate('itmes').execPopulate().then(() => {
                sl.items.forEach((item) => {
                    console.log('Delete item id:', item._id);
                    item_model.findByIdAndDelete(item._id).then(() => {
                        console.log('Item delete ok.');
                    });
                });
            });
        });

        // Lopuksi poistetaan shoppinglist
        console.log('Deleting sl.');
        sl_model.findByIdAndDelete(sl_id_to_delete).then(() => {
            res.redirect('/');
        });
    });
});

app.post('/logout', (req, res, next) => {
    req.session.destroy();
    res.redirect('/login');
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

        /*
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
        */

        let new_user = new user_model({
            name: user_name,
            shoppingLists: []
        });

        new_user.save().then(() => {
            return res.redirect('/login');
        });
    });
});

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
