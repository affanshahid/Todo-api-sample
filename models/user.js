var _ = require('underscore');
var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('user',
        {
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true
                }
            },
            salt: {
                type: DataTypes.STRING
            },
            hashed_password: {
                type: DataTypes.STRING
            },
            password: {
                type: DataTypes.VIRTUAL,
                allowNull: false,
                validate: {
                    len: [7, 100]
                },
                set: function(value) {
                    var salt = bcrypt.genSaltSync(10);
                    var hashedPassword = bcrypt.hashSync(value, salt);

                    this.setDataValue('password', value);
                    this.setDataValue('hashed_password', hashedPassword);
                    this.setDataValue('salt', salt);
                }
            }
        },
        {
            hooks: {
                beforeValidate: function(user) {
                    if (_.isString(user.email))
                        user.email = user.email.toLowerCase();
                }
            },
            instanceMethods: {
                toPublicJSON: function () {
                    return _.omit(this.toJSON(), 'password', 'salt', 'hashed_password');
                }
            }
        });
};