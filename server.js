var express = require('express');


var app = express();
var PORT = process.env.PORT || 8000;

app.get('/', function(req, res) {
    res.send('Todo API Root');
});

app.listen(PORT, function() {
    console.log('Server listening on port ' + PORT + '!');
});

