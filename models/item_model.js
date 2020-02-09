const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

module.exports = item_model;