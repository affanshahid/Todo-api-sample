/*globals Promise*/
var _ = require('underscore');
var bcrypt = require('bcrypt');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
    var user = sequelize.define('user',
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
            classMethods: {
                authenticate: function(loginData) {
                    return new Promise(function(resolve, reject) {
                        if (!_.isString(loginData.email) || !_.isString(loginData.password))
                            return reject();

                        user.findOne({ where: { email: loginData.email.toLowerCase() } })
                            .then(function(user) {
                                if (user && bcrypt.compareSync(loginData.password,
                                    user.get('hashed_password')))
                                    resolve(user);
                                else
                                    reject();
                            }, function() {
                                reject();
                            });
                    });
                },
                findByToken: function(token) {
                    return new Promise(function(resolve, reject) {
                        try {
                            var decodedJWT = jwt.verify(token, 'qwerty123');
                            var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123');
                            var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
                            var id = tokenData.id;

                            user.findById(id).then(function(user) {
                                if (user)
                                    resolve(user);
                                else
                                    reject();
                            }, function(e) {
                                reject();
                            });
                        } catch (e) {
                            reject();
                        }
                    });
                }
            },
            instanceMethods: {
                toPublicJSON: function() {
                    return _.omit(this.toJSON(), 'password', 'salt', 'hashed_password');
                },
                generateToken: function(type) {
                    if (!_.isString(type))
                        return undefined;
                    try {
                        var dataString = JSON.stringify({ id: this.get('id'), type: type });
                        var encryptedString = cryptojs.AES.encrypt(dataString, 'abc123').toString();
                        return jwt.sign({ token: encryptedString }, 'qwerty123');
                    } catch (e) {
                        console.error(e);
                        return undefined;
                    }
                }
            }
        });
    return user;
};