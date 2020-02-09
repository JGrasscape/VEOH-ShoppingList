const sls_view = ((data) => {
    let html = `
        <html>
        <head><title>ShoppingList</title>
        <meta http-equiv="Content-Type", content="text/html;charset=UTF-8">
        <link rel="stylesheet" type="text/css" href="./css/style.css">
        </head> 
        <body>
            <h1>ShoppingList</h1>
            <h2>Shoppinglists for user: ${data.user_name}</h2>`;
       
        data.sls.forEach((sl) => {                        
            html += `
                <a href="./sl/${sl._id}">${sl.name}</a>               
                <form action="delete_sl" method="POST">
                    <input type="hidden" name="sl_id" value="${sl._id}">
                    <button type="submit">Delete list</button>
                </form>
            `;
        });

        html += `
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
        `;
    return html;
});

const sl_view = ((data) => {
    let html = `
        <html>
        <head><title>ShoppingList</title>
        <meta http-equiv="Content-Type", content="text/html;charset=UTF-8">
        <link rel="stylesheet" type="text/css" href="../css/style.css">
        </head> 
        <body>
            <h1>Shoppinglist: ${data.sl_name}</h1>
            <h2>Items:</h2>
            <table>
                <tr>
                    <th>Item</th>
                    <th>Count</th>
                    <th>Img</th>
                    <th/>
                </tr>            
    `;

    // Haetaan itemit kannasta
    data.items.forEach((item) => { 
        html += `                    
                <tr>
                    <td>${item.name}</td>
                    <td>
                        ${item.count}
                        <form action="plus_item" method="POST">
                            <input type="hidden" name="item_id" value="${item._id}">
                            <input type="hidden" name="sl_id" value="${data.sl_id}">
                            <button type="submit">+</button>
                        </form>
                        <form action="minus_item" method="POST">
                            <input type="hidden" name="item_id" value="${item._id}">
                            <input type="hidden" name="sl_id" value="${data.sl_id}">
                            <button type="submit">-</button>
                        </form>
                    </td>
                    <td><img src="${item.img}" width=100px heigth=100px alt="Image"/></td>
                    <td>
                        <form action="delete_item" method="POST">
                            <input type="hidden" name="item_id" value="${item._id}">
                            <input type="hidden" name="sl_id" value="${data.sl_id}">
                            <button type="submit">Delete item</button>
                        </form>
                    </td>
                </tr>                    
        `;                                                
    });        

    html += `
            </table>
            <hr/>
            <form action="/add-item/${data.sl_id}" method="POST">
                <input type="text" name="item" placeholder="item">
                <input type="number" name="count" placeholder="quantity">
                <input type="text" name="img" placeholder="img URL">
                <button type="submit">Add an item</button>
            </form>
            <hr/>
            <footer>&copy; Janne Ruohoniemi</footer>
        </body>
        </html>
    `;
    return html;
});

module.exports.sls_view = sls_view;
module.exports.sl_view = sl_view;