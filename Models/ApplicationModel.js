const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Job = require("./JobModel");

const Application = sequelize.define(
  "Application",
  {
    ApplicationId: {
      type: DataTypes.INTEGER,
      autoIncrement:true,
      primaryKey: true
    },
    ApplicantName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    PhoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LinkedIn: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isUrl: true }
    },
    Skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    GitHub: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isUrl: true }
    },
    Portfolio: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isUrl: true }
    },
    Experience: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Resume: {
      type: DataTypes.STRING,
      allowNull: false // must upload file link
    },
    Location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    WillingToRelocate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    CoverLetter: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Status: {
      type: DataTypes.ENUM("Applied", "Shortlisted", "Interview", "Rejected", "Hired"),
      defaultValue: "Applied"
    }
  },
  {
    tableName: "Applications",
    timestamps: true,
    paranoid: true
  }
);

// Relation: One Job -> Many Applications
Application.belongsTo(Job, { foreignKey: "JobId", onDelete: "CASCADE" });
Job.hasMany(Application, { foreignKey: "JobId" });

module.exports = Application;
