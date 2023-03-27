const { Sequelize, DataTypes } = require('sequelize');

module.exports = new Sequelize(
    'mydb', 'root', 'root', {
        dialect: 'sqlite',
        storage: 'mydb.sqlite',
        logging: true
});
