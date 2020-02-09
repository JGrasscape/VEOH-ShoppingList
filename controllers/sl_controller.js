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

module.exports.get_sls = get_sls;