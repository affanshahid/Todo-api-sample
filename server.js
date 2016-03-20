var _ = require('underscore');
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
    var body = _.pick(req.body, 'completed', 'description');

    if (!_.isString(body.description) || !_.isBoolean(body.completed) ||
        body.description.trim().length === 0) {
        return res.status(400).send();
    }

    body.description = body.description.trim();
    body.id = todoNextId++;
    todos.push(body);
    res.json(body);
});

app.get('/todos/:id', function(req, res) {
    var id = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, { id: id });
    matchedTodo ? res.json(matchedTodo) : res.status(404).send();
});

app.delete('/todos/:id', function(req, res) {
    var id = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, { id: id });
    todos = _.without(todos, matchedTodo);
    matchedTodo ? res.json(matchedTodo) : res.status(404).send();
});

app.put('/todos/:id', function(req, res) {
    var id = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, { id: id });
    var body = _.pick(req.body, 'completed', 'description');
    var validAttrs = {};

    if (!matchedTodo)
        return res.status(404).send();

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttrs.completed = body.completed;
    } else if (body.hasOwnProperty('completed'))
        return res.status(400).send();

    if (body.hasOwnProperty('description') && _.isString(body.description)
        && body.description.trim().length > 0) {
        validAttrs.description = body.description;
    } else if (body.hasOwnProperty('description'))
        return res.status(400).send();

    _.extend(matchedTodo, validAttrs);
    res.json(matchedTodo); 
});

app.listen(PORT, function() {
    console.log('Server listening on port ' + PORT + '!');
});

