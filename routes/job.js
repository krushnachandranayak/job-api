const express = require("express")
const router = express.Router()
const jobController = require("../controllers/jobController")
const {authenticateToken} = require("../middleware/authMiddleware")


router.get("/", jobController.getAllJobs)
router.get("/:id", jobController.getJobById)
router.post("/", authenticateToken, jobController.createJob)  
router.put("/:id", authenticateToken, jobController.updateJob)
router.delete("/:id", authenticateToken, jobController.deleteJob)


module.exports = router