const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const bcrypt = require("bcrypt");

const Admin = sequelize.define("Admin", {
  AdminId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  Password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: "Admins",
  timestamps: true,
  paranoid: true,
});

Admin.beforeCreate(async (admin) => {
  const salt = await bcrypt.genSalt(10);
  admin.Password = await bcrypt.hash(admin.Password, salt);
});

module.exports = Admin;
