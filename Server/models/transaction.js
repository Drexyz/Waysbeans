'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      transaction.belongsTo(models.user, {
        as: 'user',
        foreignKey: {
          name: 'user_id'
        }
      });
      transaction.hasMany(models.order, {
        as: "productOrdered",
        foreignKey: {
          name: "transaction_id",
        },
      });
    }
  };
  transaction.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.TEXT,
    attachment: DataTypes.STRING,
    status: DataTypes.STRING,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'transaction',
  });
  return transaction;
};