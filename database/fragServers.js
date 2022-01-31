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
        server: { type: DataTypes.STRING },
        cpu: { type: DataTypes.STRING },
        ram: { type: DataTypes.STRING },
        attacks: { type: DataTypes.INTEGER },
        attacking: { type: DataTypes.INTEGER },
        overload: { type: DataTypes.BOOLEAN },
        location: { type: DataTypes.STRING },
        vip: { type: DataTypes.FLOAT },
      },
      {
        tableName: "fragServers",
        timestamps: true,
        sequelize,
      }
    );
  }
};
