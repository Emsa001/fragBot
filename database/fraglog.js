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
        host: { type: DataTypes.STRING },
        userID: { type: DataTypes.STRING },
        guildID: { type: DataTypes.STRING },
        guildName: { type: DataTypes.STRING },
        userName: { type: DataTypes.STRING },
        concurrents: { type: DataTypes.STRING },
        duration: { type: DataTypes.STRING },
        vip: { type: DataTypes.BOOLEAN },
      },
      {
        tableName: "fraglog",
        timestamps: true,
        sequelize,
      }
    );
  }
};
