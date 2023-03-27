const  sequelize = require('./database');
const {DataTypes} = require('sequelize');

const User = sequelize.define('user', {
    id:{type : DataTypes.INTEGER, primaryKey:true, unique:true, autoIncrement:true },
    chatId: {type: DataTypes.STRING, unique: true},
    firstName: {type: DataTypes.STRING, unique:false, defaultValue : 'test'},
    secondName: {type: DataTypes.STRING, unique:false, defaultValue : null},
    thirdName: {type: DataTypes.STRING, unique:false, defaultValue : null},
    workInfo: {type: DataTypes.STRING, unique:false, defaultValue : null},
    companyInfo: {type: DataTypes.STRING, unique:false, defaultValue : null},
    companyInn: {type: DataTypes.STRING, unique:true, defaultValue : null},
    state: {type: DataTypes.STRING, unique:false, defaultValue : 'start'},
    registerComplete: {type: DataTypes.BOOLEAN, unique:false, defaultValue: false},
});

module.exports = User;