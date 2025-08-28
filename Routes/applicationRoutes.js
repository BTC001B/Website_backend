const express = require("express");
const router = express.Router();
const applicationController = require("../Controllers/applicationController");
const upload = require("../utils/upload");

router.post("/",upload.single("Resume"), applicationController.createApplication);
router.get("/", applicationController.getApplications);          // All
router.get("/:id", applicationController.getApplicationById);    // One
router.put("/:id", applicationController.updateApplication);     // Update
router.delete("/:id", applicationController.deleteApplication);  // Delete
router.get("/applicationid/:id/download-resume", applicationController.downloadResume);
router.patch("/:id/status", applicationController.updateApplicationStatus);


module.exports = router;
