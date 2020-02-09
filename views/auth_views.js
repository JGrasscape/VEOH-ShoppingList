const login_view = () => {
    let html = `
        <html>
        <head><title>ShoppingList</title>
        <meta http-equiv="Content-Type", content="text/html;charset=UTF-8">
        <link rel="stylesheet" type="text/css" href="../css/style.css">
        </head>
        <body>
            <h1>ShoppingList</h1>
            Please login or register a new username.<br/>
            <form action="/login" method="POST">
                <h2>Existing users:</h2>
                <input type="text" name="user_name" placeholder="Username">
                <button type="submit">Log in</button>
            </form>
            <hr/>
            <form action="/register" method="POST">
                <h2>New users:</h2>
                <input type="text" name="user_name" placeholder="Username">
                <button type="submit">Register</button>
            </form>
            <hr/>
            <footer>&copy; Janne Ruohoniemi</footer>
        </body>
        </html>
    `;
    return html;
};

module.exports.login_view = login_view;
