const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Job = sequelize.define("Job", {
  JobId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  Requirement: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  Experience: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  JobType: {
    type: DataTypes.ENUM("Full-Time", "Part-Time", "Internship"),
    allowNull: false,
    defaultValue: "Full-Time"
  },
  EmploymentMode: {
    type: DataTypes.ENUM("On-Site", "Remote", "Hybrid"),
    allowNull: false,
    defaultValue: "On-Site"
  },
  Location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  SalaryRange: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ApplicationLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ApplicationDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  Status: {
    type: DataTypes.ENUM("Active", "Draft", "Closed"),
    defaultValue: "Active"
  }
}, {
  tableName: "Jobs",
  timestamps: true,
  paranoid: true
});

module.exports = Job;
