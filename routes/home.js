const express = require("express");

const homeController = require("../controllers/home");
const router = express.Router();
const isAuth = require("../middleware/isAuth");

// Index
router.get("/", homeController.getIndex);

// Fetch All Courses
router.get("/courses", homeController.getCourses);

router.get("/my-courses", isAuth, homeController.getEnrolledCourse);

router.post("/my-courses", isAuth, homeController.postEnrollCourse);

module.exports = router;
