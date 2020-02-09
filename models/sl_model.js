const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

module.exports = sl_model;