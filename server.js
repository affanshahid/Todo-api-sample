var _ = require('underscore');
var express = require('express');
var bodyParser = require('body-parser');
var db = require('./db.js');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 8000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('Todo API Root');
});

app.get('/todos', middleware.requireAuthentication, function(req, res) {
    var query = req.query;
    var where = {};

    if (query.hasOwnProperty('completed') &&
        (query.completed === 'true'
            || query.completed === 'false')) {
        where.completed = (query.completed === 'true');
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = { $like: '%' + query.q + '%' };
    }

    db.todo.findAll({ where: where })
        .then(function(todos) {
            res.json(todos);
        }, function() {
            res.status(500).send();
        });
});

app.post('/todos', middleware.requireAuthentication, function(req, res) {
    var body = _.pick(req.body, 'completed', 'description');

    db.todo.create(body).then(function(todo) {
        req.user.addTodo(todo).then(function() {
            return todo.reload();
        }).then(function(todo) {
            res.json(todo.toJSON());
        });

    }, function(e) {
        res.status(400).json(e);
    });
});

app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var id = parseInt(req.params.id, 10);

    db.todo.findById(id).then(function(todo) {
        if (todo)
            res.json(todo.toJSON());
        else
            res.status(404).send();
    }, function() {
        res.status(500).send();
    });
});

app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var id = parseInt(req.params.id, 10);

    db.todo.destroy({ where: id }).then(function(numDeletedRows) {
        if (numDeletedRows > 0)
            res.status(204).send();
        else
            res.status(404).send();
    }, function() {
        res.status(500).send();
    });
});

app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var id = parseInt(req.params.id, 10);
    var body = _.pick(req.body, 'completed', 'description');
    var attrs = {};

    if (body.hasOwnProperty('completed')) {
        attrs.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attrs.description = body.description;
    }

    db.todo.findById(id).then(function(todo) {
        if (todo) {
            todo.update(attrs).then(function(todo) {
                res.json(todo.toJSON());
            }, function(e) {
                res.status(400).json(e);
            });
        } else {
            res.status(404).send();
        }
    }, function() {
        res.status(500).send();
    });
});

app.post('/users', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function(user) {
        res.json(user.toPublicJSON());
    }, function(e) {
        res.status(400).json(e);
    });
});

app.post('/users/login', function(req, res) {
    var loginData = _.pick(req.body, 'email', 'password');

    db.user.authenticate(loginData).then(function(user) {
        var token = user.generateToken('authentication');

        if (token)
            res.header('Auth', user.generateToken('authentication')).json(user.toPublicJSON());
        else
            res.status(401).send();
    }, function() {
        res.status(401).send();
    });
});

db.sequelize.sync({ force: true }).then(function() {
    app.listen(PORT, function() {
        console.log('Server listening on port ' + PORT + '!');
    });
});
