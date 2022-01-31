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
        blacklist: { type: DataTypes.STRING },
        guild: { type: DataTypes.STRING },
        user: { type: DataTypes.STRING },
      },
      {
        tableName: "fragblacklist",
        timestamps: true,
        sequelize,
      }
    );
  }
};
