const  sequelize = require('./database');
const {DataTypes} = require('sequelize');

const User = sequelize.define('user', {
    id:{type : DataTypes.INTEGER, primaryKey:true, unique:true, autoIncrement:true },
    chatId: {type: DataTypes.STRING, unique: true},
    userName: {type: DataTypes.STRING, unique:true, defaultValue : null},
    firstName: {type: DataTypes.STRING, unique:false, defaultValue : 'test'},
    lastName: {type: DataTypes.STRING, unique:false, defaultValue : 'test'},
    middleName: {type: DataTypes.STRING, unique:false, defaultValue : 'test'},
    workInfo: {type: DataTypes.STRING, unique:false, defaultValue : null},
    companyInfo: {type: DataTypes.STRING, unique:false, defaultValue : null},
    companyAdres: {type: DataTypes.STRING, unique:false, defaultValue : null},
    companyLabel: {type: DataTypes.STRING, unique:false, defaultValue : null},
    companyInn: {type: DataTypes.STRING, unique:true, defaultValue : null},
    telephone: {type: DataTypes.STRING, unique:false, defaultValue : null},
    city: {type: DataTypes.STRING, unique:false, defaultValue : null},
    aboutChannel: {type: DataTypes.STRING, unique:false, defaultValue : null},
    distributeName: {type: DataTypes.STRING, unique:false, defaultValue : 'нет данных'},
    state: {type: DataTypes.STRING, unique:false, defaultValue : null},
    registerComplete: {type: DataTypes.BOOLEAN, unique:false, defaultValue: false},
});

module.exports = User;