const mongoose = require("mongoose");

const User = require("../models/user");
const Course = require("../models/course");

const COURSES_PER_PAGE = 3;
const MENTORS_PER_PAGE = 4;
const USERS_PER_PAGE = 4;

// Render Index Page
exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;

  let totalItems;
  Course.find()
    .countDocuments()
    .then((total) => {
      totalItems = total;
      return Course.find()
        .skip((page - 1) * COURSES_PER_PAGE)
        .limit(COURSES_PER_PAGE);
    })
    .then((courses) => {
      res.render("home/index", {
        pageTitle: "NextGen",
        courses: courses,
        path: "/",
        currentPage: page,
        hasNextPage: COURSES_PER_PAGE * page < totalItems,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalItems / COURSES_PER_PAGE),
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: "ERROR",
      });
    });
};

// Get Courses
exports.getCourses = (req, res, next) => {
  const page = +req.query.page || 1;
  let message = req.flash("error");
  let infoMessage = req.flash("info");

  if (infoMessage.length > 0) {
    infoMessage = infoMessage[0];
  } else {
    infoMessage = null;
  }

  Course.find()
    .countDocuments()
    .then((total) => {
      totalItems = total;
      return Course.find()
        .skip((page - 1) * COURSES_PER_PAGE)
        .limit(COURSES_PER_PAGE);
    })
    .then((courses) => {
      console.log('COURSES '+courses)
      req.session.user
      .populate("enrollments.items.courseId")
      .then(user => {
        return req.session.user.getEnrollments(user.enrollments.items)
      })
      .then(enrolledCourses => {
        console.log('enrol '+enrolledCourses)
        res.render("home/courses", {
          pageTitle: "NextGen",
          courses: courses,
          path: "/courses",
          enrolledCourses: enrolledCourses,
          infoMessage: infoMessage,
          currentPage: page,
          hasNextPage: COURSES_PER_PAGE * page < totalItems,
          hasPrevPage: page > 1,
          nextPage: page + 1,
          prevPage: page - 1,
          lastPage: Math.ceil(totalItems / COURSES_PER_PAGE),
        });
      })
    })
    .catch((err) => {
      return res.status(500).json({
        message: "ERROR",
      });
    });
};

exports.getEnrolledCourse = (req, res, next) => {
  req.session.user
    .populate("enrollments.items.courseId")
    // .execPopulate()
    .then((user) => {
      //console.log("populate: ", user.cart.items);
      return req.session.user.getEnrollments(user.enrollments.items);
    })
    .then((courses) => {
      console.log("ENROLLED COURSES : ", courses);
      res.render("home/enrollments", {
        path: "/my-courses",
        pageTitle: "Your Cart",
        courses: courses,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Enroll Course (POST)
exports.postEnrollCourse = (req, res, next) => {
  const courseId = req.body.courseId;
  Course.findById(courseId)
    .then((course) => {
      return req.session.user.addEnrollment(course);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/my-courses");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Get User List
// exports.getUsers = (req, res, next) => {
//   User.find()
//     .then((result) => {
//       res.status(200).json({
//         users: result,
//       });
//     })
//     .catch((err) => {
//       res.status(500).json({
//         message: "error",
//       });
//     });
// };
