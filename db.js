var Sequelize = require('sequelize');

var env = process.env.NODE_ENV || 'development';
var sequelize;

if (env === 'production') {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        typeValidation: true
    });
} else {
    sequelize = new Sequelize(undefined, undefined, undefined, {
        dialect: 'sqlite',
        storage: './data/dev-todo-api.sqlite',
        typeValidation: true
    });
}

var db = {};

db.todo = sequelize.import('./models/todo.js');
db.user = sequelize.import('./models/user.js');
db.token = sequelize.import('./models/token.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;