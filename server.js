var app = require('./index');

var port = process.env.PORT || process.env.DEFAULT_PORT

app.listen(port, () => {
    console.log("Server running on port", port);
})
