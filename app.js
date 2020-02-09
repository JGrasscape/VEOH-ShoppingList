const express = require('express');
const PORT = process.env.PORT || 8080;
const body_parser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');

// Models
const sl_model = require('./models/sl_model');
const item_model = require('./models/item_model');

// Controllers
const auth_controller = require('./controllers/auth_controller');

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

// Pääsivu käyttäjälle, joka on kirjautunut sisään
app.get('/', is_logged_handler, (req, res, next) => {
    const user = req.user;
    console.log('käyttäjän', user.name, 'listat');

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
                <link rel="stylesheet" type="text/css" href="../css/style.css">
                </head> 
                <body>
                    <h1>Shoppinglist: ${sl.name}</h1>
                    <h2>Items:</h2>
                    <table>
                        <tr>
                            <th>Item</th>
                            <th>Count</th>
                            <th>Img</th>
                            <th/>
                        </tr>            
            `);
        
            // Haetaan itemit kannasta
            sl.items.forEach((item) => { 
                console.log('item löytyi', item);
                res.write(`                    
                        <tr>
                            <td>${item.name}</td>
                            <td>
                                ${item.count}
                                <form action="plus_item" method="POST">
                                    <input type="hidden" name="item_id" value="${item._id}">
                                    <input type="hidden" name="sl_id" value="${sl._id}">
                                    <button type="submit">+</button>
                                </form>
                                <form action="minus_item" method="POST">
                                    <input type="hidden" name="item_id" value="${item._id}">
                                    <input type="hidden" name="sl_id" value="${sl._id}">
                                    <button type="submit">-</button>
                                </form>
                            </td>
                            <td><img src="${item.img}" width=100px heigth=100px alt="Image"/></td>
                            <td>
                                <form action="delete_item" method="POST">
                                    <input type="hidden" name="item_id" value="${item._id}">
                                    <input type="hidden" name="sl_id" value="${sl._id}">
                                    <button type="submit">Delete item</button>
                                </form>
                            </td>
                        </tr>                    
                `);                                                
            });        

            res.write(`
                    </table>
                    <hr/>
                    <form action="/add-item/${sl._id}" method="POST">
                        <input type="text" name="item" placeholder="item">
                        <input type="number" name="count" placeholder="quantity">
                        <input type="text" name="img" placeholder="img URL">
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

app.post('/sl/plus_item', (req, res, next) => {
    const item_id = req.body.item_id;
    const sl_id = req.body.sl_id;

    item_model.findById(item_id).then((item) => {
        console.log('Adding count to item', item.name);
        item.count += 1;
        item.save().then(() => {
            return res.redirect(`/sl/${sl_id}`);
        });
    });
});

app.post('/sl/minus_item', (req, res, next) => {
    const item_id = req.body.item_id;
    const sl_id = req.body.sl_id;

    item_model.findById(item_id).then((item) => {
        console.log('Minus to item', item.name);
        item.count -= 1;
        if (item.count < 0) {
            item.count = 0;
        }
        item.save().then(() => {
            return res.redirect(`/sl/${sl_id}`);
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
            count: req.body.count,
            img: req.body.img
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

app.post('/sl/delete_item', (req, res, next) => {
    const user = req.user;
    const item_id_to_delete = req.body.item_id;
    const sl_id = req.body.sl_id;

    console.log('Deleting item ', item_id_to_delete);
    item_model.findByIdAndDelete(item_id_to_delete).then(() => {
        res.redirect(`/sl/${sl_id}`);
    });

    // TODO: Poista viittaus itemiin vielä shoppinglistiltä
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
