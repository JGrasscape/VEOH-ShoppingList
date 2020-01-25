const express = require('express');
const PORT = process.env.PORT || 8080;
const session = require('express-session');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sl_schema = new Schema({
    user: {
        type: String,
        required: true,
        shoppingList: {
            type: String,
            required: true,
            item: {
                type: String,
                required: true
            }
        }
    }
});

const sl_model = mongoose.model('sl', sl_schema);

let app = express();

app.use((req, res, next) => {
    console.log('PATH: ' + req.path);
    next();
});

app.get('/', (req, res, next) => {
    res.send('Hello!');

    // Testidataa kantaan
    let new_user = new sl_model({
        user: 'test name',
        shoppingList: 'test list'
    });

    new_user.save();

    res.end();
});

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
