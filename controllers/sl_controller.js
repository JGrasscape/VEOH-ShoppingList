const sl_model = require('../models/sl_model');
const item_model = require('../models/item_model');
const sl_views = require('../views/sl_views');

// Pääsivu käyttäjälle, joka on kirjautunut sisään
const get_sls = (req, res, next) => {
    const user = req.user;

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

// Ostoslista ja sen sisältämät itemit
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

// Itemin määrän kasvatus
const post_plus_item = (req, res, next) => {
    const item_id = req.body.item_id;
    const sl_id = req.body.sl_id;

    item_model.findById(item_id).then((item) => {        
        item.count += 1;
        item.save().then(() => {
            return res.redirect(`/sl/${sl_id}`);
        });
    });
};

// Itemin määrän vähentäminen
const post_minus_item = (req, res, next) => {
    const item_id = req.body.item_id;
    const sl_id = req.body.sl_id;

    item_model.findById(item_id).then((item) => {
        item.count -= 1;
        if (item.count < 0) {
            item.count = 0;
        }
        item.save().then(() => {
            return res.redirect(`/sl/${sl_id}`);
        });
    });
};

// Itemin lisäys ostoslistaan
const post_add_item = (req, res, next) => {
    const sl_id = req.params.id;
    sl_model.findOne({
        _id: sl_id
    }).then((sl) => {
        // Lista löytyi, luodaan item
        let new_item = item_model({
            name: req.body.item,
            count: req.body.count,
            img: req.body.img
        });

        new_item.save().then(() => {
            // Lisätään viittaus ostoslista-objektin item-listaan
            sl.items.push(new_item);
            sl.save().then(() => {
                return res.redirect(`/sl/${sl._id}`);
            });
        });
    });
};

// Ostoslistan lisäys
const post_add_sl = (req, res, next) => {
    const user = req.user;

    let new_sl = sl_model({
        name: req.body.sl,
        items: []
    });

    new_sl.save().then(() => {
        // Lisätään viittaus käyttäjäobjektin shoppinglists-listaan
        user.shoppingLists.push(new_sl);
        user.save().then(() => {
            return res.redirect('/');
        });
    });
};

// Ostoslistan poistaminen
const post_delete_sl = (req, res, next) => {
    const user = req.user;
    const sl_id_to_delete = req.body.sl_id;

    // Poistetaan shoppinglist käyttäjältä
    const updated_sl = user.shoppingLists.filter((sl_id) => {
        return sl_id != sl_id_to_delete;
    });
    user.shoppingLists = updated_sl;

    user.save().then(() => {
        // Käyttäjä päivitetty, vittaus shoppinglistiin poistettu.
        // Itse lista ja sen itemit ovat vielä olemassa kannassa.
        // Haetaan itemit ja poistetaan.
        sl_model.findById(sl_id_to_delete).then((sl) => {
            sl.populate('itmes').execPopulate().then(() => {
                sl.items.forEach((item) => {
                    item_model.findByIdAndDelete(item._id).then(() => {
                        console.log('Item delete ok.');
                    });
                });
            });
        });

        // Lopuksi poistetaan shoppinglist
        sl_model.findByIdAndDelete(sl_id_to_delete).then(() => {
            res.redirect('/');
        });
    });
};

// Itemin poisto
const post_delete_item = (req, res, next) => {
    const user = req.user;
    const item_id_to_delete = req.body.item_id;
    const sl_id = req.body.sl_id;

    item_model.findByIdAndDelete(item_id_to_delete).then(() => {
        res.redirect(`/sl/${sl_id}`);
    });

    // TODO: Poista viittaus itemiin vielä shoppinglistiltä
};

module.exports.get_sls = get_sls;
module.exports.get_sl = get_sl;
module.exports.post_plus_item = post_plus_item;
module.exports.post_minus_item = post_minus_item;
module.exports.post_add_item = post_add_item;
module.exports.post_add_sl = post_add_sl;
module.exports.post_delete_sl = post_delete_sl;
module.exports.post_delete_item = post_delete_item;