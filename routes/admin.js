const express = require("express");

const adminController = require("../controllers/admin");
const isAdmin = require("../middleware/isAdmin");
const validator = require("../middleware/validator");

const router = express.Router();

// ----------------------------------------- MENTOR ------------------------------

// Add a new mentor (GET)
router.get("/add-mentor", isAdmin, adminController.getAddMentor);
// Add a new mentor (POST)
router.post(
  "/add-mentor",
  isAdmin,
  validator.mentorValidator,
  adminController.postAddMentor
);

// Fetch list of mentors
router.get("/mentors", isAdmin, adminController.getMentors);

// Edit Mentor => GET
router.get("/edit-mentor/:mentorId", isAdmin, adminController.getEditMentor);

// Edit Mentor => POST
router.post(
  "/edit-mentor/",
  isAdmin,
  validator.mentorUpdateValidator,
  adminController.postEditMentor
);

// Delete Mentor
router.post("/delete-mentor", isAdmin, adminController.deleteMentor);



// ------------------------------------------------- COURSES --------------------------------------

// Add a new course (GET)
router.get("/add-course", isAdmin, adminController.getAddCourse);
// Add a new course (POST)
router.post(
  "/add-course",
  isAdmin,
  validator.courseValidator,
  adminController.postAddCourse
);

// Edit Course => GET
router.get("/edit-course/:courseId", isAdmin, adminController.getEditCourse);

//Edit Course ==> POST
router.post(
  "/edit-course",
  isAdmin,
  validator.courseValidator,
  adminController.postEditCourse
);

// Enrolled course

// Delete Course
router.post("/delete-course", isAdmin, adminController.deleteCourse);

// ------------------------------------------------- USERS ---------------------------------------

// Fetch list of users
router.get("/users", isAdmin, adminController.getUsers);

// Delete User
router.post('/delete-user',isAdmin, adminController.deleteUser)

module.exports = router;
