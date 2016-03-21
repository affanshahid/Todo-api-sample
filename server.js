var _ = require('underscore');
var express = require('express');
var bodyParser = require('body-parser');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 8000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('Todo API Root');
});

app.get('/todos', function(req, res) {
    var queryParams = req.query;
    var filtered = todos;

    if (queryParams.hasOwnProperty('completed') &&
        (queryParams.completed === 'true'
            || queryParams.completed === 'false')) {
        queryParams.completed = (queryParams.completed === 'true');
        filtered = _.where(todos, { completed: queryParams.completed });
    }

    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        filtered = filtered.filter(function(todo) {
            return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) != -1;
        });
    }

    res.json(filtered);
});

app.post('/todos', function(req, res) {
    var body = _.pick(req.body, 'completed', 'description');

    db.todo.create(body).then(function(todo) {
        res.json(todo.toJSON());
    }, function(e) {
        res.status(400).json(e);
    });
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

db.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log('Server listening on port ' + PORT + '!');
    });
});
