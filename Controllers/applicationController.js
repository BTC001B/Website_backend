const Application = require("../Models/ApplicationModel");
const Job = require("../Models/JobModel");
const { sendMail } = require("../utils/mailService");
const path = require("path");
const fs = require("fs");


// Create Application
exports.createApplication = async (req, res) => {
  try {
    const { JobId, ApplicantName, Email } = req.body;
    const job = await Job.findByPk(JobId);
    if (!job) return res.status(400).json({ error: "Invalid JobId" });

    // Resume file path
    const resumePath = req.file ? req.file.path : null;
    if (req.body.Skills) {
      try {
        req.body.Skills = JSON.parse(req.body.Skills);
        if (!Array.isArray(req.body.Skills)) {
          return res.status(400).json({ error: "Skills must be a JSON array" });
        }
      } catch (err) {
        return res.status(400).json({ error: "Invalid Skills format. Use JSON array" });
      }
    }

    const application = await Application.create({
      ...req.body,
      Resume: resumePath
    });


    // Send confirmation email
    await sendMail(
      Email,
      `Application Received for ${job.Title}`,
      `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h2 style="color: #4a90e2; text-align: center;">Application Received</h2>
          <p>Hello <strong>${ApplicantName}</strong>,</p>
          <p>Thank you for applying to the <strong>${job.Title}</strong> role. Our team has received your application and will review it shortly.</p>
          <p>If your profile matches our requirements, we will reach out to you soon.</p>
          <p style="margin-top: 20px;">Best regards,<br/><strong>The Hiring Team</strong></p>
        </div>
        <p style="text-align:center; font-size: 12px; color: #aaa; margin-top: 15px;">
          &copy; ${new Date().getFullYear()} BTC Careers. All rights reserved.
        </p>
      </div>
      `
    );

    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      include: [
        {
          model: Job,
          attributes: ["JobId", "Title"], // Only get JobId and Title
        },
      ],
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [
        {
          model: Job,
          attributes: ["JobId", "Title"],
        },
      ],
    });
    if (!application) return res.status(404).json({ error: "Application not found" });
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update Application
exports.updateApplication = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) return res.status(404).json({ error: "Application not found" });

    await application.update(req.body);
    res.json(application);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Application
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) return res.status(404).json({ error: "Application not found" });

    await application.destroy();
    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadResume = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findByPk(id);

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (!application.Resume) {
      return res.status(404).json({ error: "No resume uploaded for this application" });
    }

    // Get absolute path to the resume file
    const filePath = path.join(__dirname, "..", application.Resume);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Resume file not found" });
    }

    // Send file for download
    res.download(filePath, (err) => {
      if (err) {
        return res.status(500).json({ error: "Error downloading file" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { Status, InterviewDate, InterviewTime, InterviewMode, InterviewLinkOrVenue } = req.body;

    // Validate status
    if (!Status) {
      return res.status(400).json({ error: "Status is required" });
    }
    if (!["Shortlisted", "Rejected"].includes(Status)) {
      return res.status(400).json({ error: "Invalid status. Only Shortlisted or Rejected allowed." });
    }

    // Fetch application and job
    const application = await Application.findByPk(id, {
      include: [{ model: Job, attributes: ["Title"] }]
    });

    if (!application) return res.status(404).json({ error: "Application not found" });
    if (!application.Job) return res.status(400).json({ error: "Job not linked with this application" });

    // Update status
    application.Status = Status;
    await application.save();

    // Prepare email
    let subject = "";
    let message = "";

    if (Status === "Shortlisted") {
      subject = `Shortlisted for ${application.Job.Title} - Interview Scheduled`;

      // Ensure interview details are provided
      if (!InterviewDate || !InterviewTime || !InterviewMode || !InterviewLinkOrVenue) {
        return res.status(400).json({
          error: "Interview details required for shortlisted candidates (InterviewDate, InterviewTime, InterviewMode, InterviewLinkOrVenue)."
        });
      }

      // **Fixed here** – removed const
message = `
  <div style="font-family: Arial, sans-serif; background-color: #f5f7fa; padding: 20px;">
    <div style="max-width: 750px; margin: auto; background: #ffffff; border-radius: 10px; padding: 35px; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
      
      <h2 style="color: #2e7d32; text-align: center; margin-bottom: 10px;">🎉 Congratulations, You’ve Been Shortlisted!</h2>
      <p style="text-align: center; color: #555; font-size: 15px; margin-top: 0;">
        Your journey with <strong>BURJ Tech Consultancy (OPC) Pvt Ltd.</strong> is about to begin.
      </p>
      
      <p>Dear <strong>${application.ApplicantName}</strong>,</p>
      
      <p>We are pleased to inform you that, after carefully reviewing your application for the role of 
      <strong>${application.Job.Title}</strong>, you have been <span style="color:#2e7d32; font-weight:600;">shortlisted</span> for the next stage of our recruitment process.</p>
      
      <h3 style="color: #333; margin-top: 25px;">📌 Interview Details</h3>
      <table style="width:100%; border-collapse: collapse; margin: 15px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">24/08/2025</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Time</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">12:00 PM – 01:00 PM</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Mode</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">In-person</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Venue/Link</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${InterviewLinkOrVenue}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Requirements</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">Updated Resume & Laptop</td>
        </tr>
      </table>
      
      <h3 style="color: #333; margin-top: 25px;">📝 Interview Rounds</h3>
      <p><strong>Round 1: Oral Interview</strong><br>
      • Format: One-on-one discussion with our team<br>
      • Objective: Understanding your background, skills, and problem-solving approach<br>
      • Duration: 10–15 minutes<br>
      • Mode: In-person</p>
      
      <p><strong>Round 2: Practical Assessment</strong><br>
      • Format: Task-based evaluation<br>
      • Objective: Assess your hands-on skills and ability to deliver results under time constraints<br>
      • Duration: 1 hour<br>
      • Mode: On-site</p>
      
      <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;">
      
      <h3 style="color: #333;">🌟 Our Career Growth Path</h3>
      <p>At <strong>BURJ Tech Consultancy</strong>, we believe in structured career development. Every individual is provided with a clear growth path:</p>
      <ul style="line-height: 1.8; margin: 10px 0 20px;">
        <li><strong>Internship Phase:</strong> Hands-on introduction to projects & workflows.</li>
        <li><strong>Trainee Phase:</strong> Deeper involvement with responsibilities and mentorship.</li>
        <li><strong>Staff Phase:</strong> Full-time role with ownership, stability, and long-term opportunities.</li>
      </ul>
      
      <h3 style="color: #333;">💰 Compensation & Incentives</h3>
      <p>Our salary framework is designed to be fair, transparent, and performance-driven:</p>
      <ul style="line-height: 1.8; margin: 10px 0 20px;">
        <li><strong>Internship Program:</strong> Intensive, unpaid training focused on skill-building & portfolio development.</li>
        <li><strong>Trainee Program:</strong> Stipend of ₹3,000 per month with hands-on mentorship.</li>
        <li><strong>Staff Position:</strong> ₹8,000 per month + additional company benefits.</li>
      </ul>
      
      <p><strong>Performance Incentives:</strong> Exceptional contributions are rewarded through additional compensation based on project milestones, innovation, and product quality. This ensures that your growth directly reflects your efforts and impact.</p>
      
      <p style="margin-top: 25px; font-size: 15px;">We are excited to meet you and explore how your skills and passion can align with our vision. Please ensure you are well-prepared for the interview.</p>
      
      <p style="margin-top: 20px;">Best regards,<br>
      <strong>Balaji</strong><br>
      Managing Director<br>
      BURJ Tech Consultancy (OPC) Pvt Ltd.</p>
    </div>
    
    <p style="text-align:center; font-size: 12px; color: #aaa; margin-top: 20px;">
      &copy; ${new Date().getFullYear()} BURJ Tech Consultancy. All rights reserved.
    </p>
  </div>
`;
      




    } else {
      subject = `Application Update for ${application.Job.Title}`;
message = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 700px; margin: auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      
      <h2 style="color: #e53935; text-align: center;">Application Update</h2>
      
      <p>Dear <strong>${application.ApplicantName}</strong>,</p>
      
      <p>Thank you for taking the time to apply for the <strong>${application.Job.Title}</strong> role at 
      <strong>BURJ Tech Consultancy (OPC) Pvt Ltd.</strong> We truly appreciate the effort you put into the application process and the interest you’ve shown in being part of our team.</p>
      
      <p>After careful review, we regret to inform you that we will not be moving forward with your application at this time. This decision was not easy, as we had a number of strong candidates, and each application was evaluated thoroughly.</p>
      
      <h3 style="color: #333;">A Note from Us</h3>
      <p>Although you were not selected for this role, we were genuinely impressed by your profile. We encourage you to continue building your skills and experience — growth in this field is continuous, and persistence is key.</p>
      
      <p>At <strong>BURJ Tech Consultancy</strong>, we believe in nurturing talent and providing opportunities for individuals to grow. Please feel free to apply again in the future as new roles open up that may better match your skills and aspirations.</p>
      
      <h3 style="color: #333;">Stay Connected</h3>
      <ul>
        <li>Follow our official website and LinkedIn page for updates on future opportunities.</li>
        <li>We welcome reapplications after 6 months, especially if you’ve added new skills or experiences to your profile.</li>
      </ul>
      
      <p style="margin-top: 20px;">We wish you the very best in your career journey ahead and hope to cross paths again.</p>
      
      <p>Warm regards,<br>
      <strong>The Hiring Team</strong><br>
      BURJ Tech Consultancy (OPC) Pvt Ltd.</p>
    </div>
    
    <p style="text-align:center; font-size: 12px; color: #aaa; margin-top: 20px;">
      &copy; ${new Date().getFullYear()} BURJ Tech Consultancy. All rights reserved.
    </p>
  </div>
`;

    }

    // Send email
    await sendMail(application.Email, subject, message);

    res.json({ message: `Status updated to ${Status} and email sent.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


