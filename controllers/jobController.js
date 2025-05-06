const Job = require("../models/Job");
const Employer = require("../models/Employer");

// get all jobs
exports.getAllJobs = async (req, res) => {
    try {
        const { title, location, skills } = req.query;  
        let filter = {};

        if (title) {
            filter.title = { $regex: title, $options: "i" };
        }
        if (location) {
            filter.location = { $regex: location, $options: "i" };
        }
        if (skills) {
            filter.skillsRequired = { $in: skills.split(",") };
        }

        // If the user is employer, filter jobs by the employer's ID
        if (req.user && req.user.role === "employer") {
            filter.employer = req.user.id;
        }
        

        const jobs = await Job.find(filter).populate("employer", "company");
        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ message: "No jobs found" });
        }
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//get job by id
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate("employer", "company");
        if (!job) {
            return res.status(404).json({ message: "No jobs found" });
        }
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// create job --employers
exports.createJob = async (req, res) => {
    try {  
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "you are not authorized to create job !" });
      }
  
      const employerId = req.user.id;
      const newJobData = { ...req.body, employer: employerId };
  
      const newJob = new Job(newJobData);
  
      const savedJob = await newJob.save();
  
      await Employer.findByIdAndUpdate(employerId, {
        $push: { createdJobs: savedJob._id },
      });
      res.status(201).json(savedJob,{message: "Job created successfully"});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

// update job --employers
exports.updateJob = async (req, res) => {
    try {
        const employerId = req.user.id;
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (job.employer.toString() !== employerId) {
            return res.status(403).json({
                message: "Not authorized to update this job",
            });
        }

        const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {new: true})
        .populate("employer", "company");
        return res.json(updatedJob);

    } catch (error) {
       return res.status(400).json({ message: error.message });
    }
};

// delete job --employers
exports.deleteJob = async (req, res) => {
    try {
        const employerId = req.user.id;
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (job.employer.toString() !== employerId) {
            return res.status(403).json({
                message: "Not authorized to delete this job",
            });
        }

        await Job.findByIdAndDelete(req.params.id);

        await Employer.findByIdAndUpdate(employerId, {
            $pull: { createdJobs: req.params.id },
        });

        res.json({ message: "Job deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
