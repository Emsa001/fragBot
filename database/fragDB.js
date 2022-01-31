const { DataTypes, Model } = require("sequelize");

module.exports = class config extends Model {
  static init(sequelize) {
    return super.init(
      {
        configId: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userID: { type: DataTypes.STRING },
        userName: { type: DataTypes.STRING },
        rang: { type: DataTypes.STRING },
        attacks: { type: DataTypes.INTEGER },
        attacking: { type: DataTypes.INTEGER },
        points: { type: DataTypes.INTEGER },
        usedGB: { type: DataTypes.FLOAT },
        transferLimit: { type: DataTypes.FLOAT },
        banned: { type: DataTypes.BOOLEAN },
        administrator: { type: DataTypes.STRING },
      },
      {
        tableName: "fragDB",
        timestamps: true,
        sequelize,
      }
    );
  }
};
