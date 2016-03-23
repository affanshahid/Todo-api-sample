var cryptojs = require('crypto-js');
module.exports = function(sequelize, DataTypes) {
    var token = sequelize.define('token', {
        token: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                len: [1]
            },
            set: function(value) {
                var hash = cryptojs.MD5(value).toString();

                this.setDataValue('tokenHash', hash);
                this.setDataValue('token', value);
            }
        },
        tokenHash: DataTypes.STRING
    });
    return token;
};