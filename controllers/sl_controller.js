const sl_model = require('../models/sl_model');
const item_model = require('../models/item_model');
const sl_views = require('../views/sl_views');

// Pääsivu käyttäjälle, joka on kirjautunut sisään
const get_sls = (req, res, next) => {
    const user = req.user;
    console.log('käyttäjän', user.name, 'listat');

    // Haetaan  tietokannasta käyttäjän ostoslistat
    user.populate('shoppingLists').execPopulate().then(() => {
        let data = {
            user_name: user.name,
            sls: user.shoppingLists
        };
        let html = sl_views.sls_view(data);
        res.send(html);
    });
};

const get_sl = (req, res, next) => {
    const sl_id = req.params.id;
    sl_model.findOne({
        _id: sl_id
    }).then((sl) => {
        sl.populate('items').execPopulate().then(() => {
            let data = {
                sl_name: sl.name,
                items: sl.items,
                sl_id: sl._id
            };
            let html = sl_views.sl_view(data);
            res.send(html);
        });
    });
};

module.exports.get_sls = get_sls;
module.exports.get_sl = get_sl;