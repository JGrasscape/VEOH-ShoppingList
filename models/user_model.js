const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

module.exports = user_model;