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

        //console.log(user.shoppingLists);        
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

module.exports.sls_view = sls_view;