'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('config');
const db = {};

let sequelize;
if (config.get(`Server.dbConfig.${env}`).use_env_variable) {
  sequelize = new Sequelize(process.env[config.get(`Server.dbConfig.${env}`).use_env_variable], config.get(`Server.dbConfig.${env}`));
} else {
  // console.log(config.get(`Server.dbConfig.${env}`).use_env_variable)
  sequelize = new Sequelize(config.get(`Server.dbConfig.${env}`).database, config.get(`Server.dbConfig.${env}`).username, config.get(`Server.dbConfig.${env}`).password, config.get(`Server.dbConfig.${env}`));
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
