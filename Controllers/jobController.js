const Job = require("../Models/JobModel");

// Create Job
exports.createJob = async (req, res) => {
  try {
    const job = await Job.bulkCreate(req.body);
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all Jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Job
exports.updateJob = async (req, res) => {
  try {
    const [updated] = await Job.update(req.body, { where: { JobId: req.params.id } });
    if (!updated) return res.status(404).json({ error: "Job not found" });
    res.json({ message: "Job updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Job
exports.deleteJob = async (req, res) => {
  try {
    const deleted = await Job.destroy({ where: { JobId: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
