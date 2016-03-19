var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var PORT = process.env.PORT || 8000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('Todo API Root');
});

app.get('/todos', function(req, res) {
    res.json(todos);
});

app.post('/todos', function(req, res) {
    req.body.id = todoNextId++;
    todos.push(req.body);
    res.json(req.body);
});

app.get('/todos/:id', function(req, res) {
    var id = req.params.id;
    var matchedTodo = undefined;

    todos.forEach(function(todo) {
        if (todo.id == id)
            matchedTodo = todo;
    });
    matchedTodo ? res.json(matchedTodo) : res.status(404).send();
});

app.listen(PORT, function() {
    console.log('Server listening on port ' + PORT + '!');
});

