var express = require('express');

var app = express();
var PORT = process.env.PORT || 8000;

var todos = [
    {
        id: 1,
        description: 'Get milk',
        completed: false
    },
    {
        id: 2,
        description: 'Mow lawn',
        completed: false
    },
    {
        id: 3,
        description: 'plot diabollicaly',
        completed: true
    }
];

app.get('/', function(req, res) {
    res.send('Todo API Root');
});

app.get('/todos', function(req, res) {
    res.json(todos);
});

app.get('/todos/:id', function(req, res) {
    var id = req.params.id;
    var matchedTodo = undefined;

    todos.forEach(function(todo) {
        if (todo.id == id)
            matchedTodo = todo;
    });
    console.log(id, matchedTodo);
    matchedTodo ? res.json(matchedTodo) : res.status(404).send();

});

app.listen(PORT, function() {
    console.log('Server listening on port ' + PORT + '!');
});

