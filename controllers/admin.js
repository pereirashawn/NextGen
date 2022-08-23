const Mentor = require("../models/mentor");
const Course = require("../models/course");
const User = require("../models/user");
const getMentor = require("../middleware/fetchMentors");
const { validationResult } = require("express-validator");
const MENTORS_PER_PAGE = 3;
const USERS_PER_PAGE = 3;

// -------------------------------------- MENTOR -------------------------------
// Get list of mentors
exports.getMentors = (req, res, next) => {
  const page = +req.query.page || 1;

  Mentor.find()
  .countDocuments()
  .then(total => {
    totalItems = total
    return Mentor.find()
      .skip((page-1) * MENTORS_PER_PAGE)
      .limit(MENTORS_PER_PAGE)
  })
    .then((mentorList) => {
      res.render("admin/mentors", {
        pageTitle: "Mentors",
        path: "/admin/mentors",
        mentors: mentorList,
        currentPage: page,
        hasNextPage: (MENTORS_PER_PAGE * page) < totalItems,
        hasPrevPage: page > 1,
        nextPage: page+1,
        prevPage: page-1,
        lastPage: Math.ceil(totalItems/MENTORS_PER_PAGE)
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: "ERROR",
      });
    });
  // res.render('admin/mentors',{
  //     pageTitle: 'mentor',
  //     path: '/mentors'
  // })
  // Mentor.find()
  //     .then(mentors => {
  //         return res.status(200).json({
  //             mentors: mentors
  //         })
  //     })
  //     .catch(err => {
  //         return res.status(500).json({
  //             message: 'Failed to fetch list of mentors'
  //         })
  //     })
};

// Adding a new mentor - GET
exports.getAddMentor = (req, res, next) => {
  res.render("admin/edit-mentor", {
    pageTitle: "Add Mentor",
    path: "/admin/mentors",
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    hasErrors: false,
    errorMessage: null,
    validationErrors: [],
  });
};

// Adding a new mentor - POST
exports.postAddMentor = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const contact = req.body.contact;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-mentor", {
      pageTitle: "Add Mentor",
      path: "/admin/add-mentor",
      editing: false,
      hasErrors: true,
      errorMessage: errors.array()[0].msg,
      mentor: {
        name: name,
        email: email,
        contact: contact,
      },
      isAuthenticated: req.session.isLoggedIn,
      validationErrors: errors.array(),
    });
  }

  const newMentor = new Mentor({
    name: name,
    email: email,
    contact: contact,
  });

  return newMentor
    .save()
    .then((result) => {
      console.log("Mentor registration successfull");
      res.redirect("/admin/mentors");
    })
    .catch((err) => {
      return res.status(500).json({
        message: "Mentor Addition Failed",
      });
    });
};

// Edit Mentor Page - GET
exports.getEditMentor = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  } else {
    // Retrive the product
    const mentorId = req.params.mentorId;
    Mentor.findById(mentorId)
      .then((mentor) => {
        if (!mentor) {
          res.redirect("/"); // Redirect if no mentor found
        } else {
          res.render("admin/edit-mentor", {
            pageTitle: "Edit Mentor",
            path: "/admin/edit-mentor",
            editing: true,
            mentor: mentor,
            isAuthenticated: req.session.isLoggedIn,
            hasErrors: false,
            errorMessage: null,
            validationErrors: [],
          });
        }
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  }
};

// Edit a Mentor - POST
exports.postEditMentor = (req, res, next) => {
  const mentorId = req.body.mentorId;
  const updatedName = req.body.name;
  const updatedEmail = req.body.email;
  const updatedContact = req.body.contact;
  const errors = validationResult(req);

  console.log(errors.array());

  Mentor.findById(mentorId)
    .then((mentor) => {
      if (!req.session.isAdmin) {
        return res.redirect("/");
      }

      if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-mentor", {
          pageTitle: "Edit Mentor",
          path: "/admin/edit-mentor",
          editing: true,
          hasErrors: true,
          errorMessage: errors.array()[0].msg,
          mentor: {
            name: updatedName,
            email: updatedEmail,
            contact: updatedContact,
            _id: mentorId,
          },
          isAuthenticated: req.session.isLoggedIn,
          validationErrors: errors.array(),
        });
      } else {
        mentor.name = updatedName;
        mentor.email = updatedEmail;
        mentor.contact = updatedContact;

        return mentor.save().then((result) => {
          console.log("MENTOR UPDATED SUCCESSFULLY!!");
          res.redirect("/admin/mentors");
        });
      }
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Delete a Mentor - POST
exports.deleteMentor = (req, res, next) => {
  const mentorId = req.body.mentorId;
  console.log("delete function " + mentorId);
  Mentor.findById(mentorId)
    .then((mentor) => {
      if (!mentor) {
        return next(new Error("Mentor not found"));
      }

      return Mentor.findByIdAndRemove({ _id: mentorId });
    })
    .then((result) => {
      console.log("Mentor Deleted");
      res.redirect("/admin/mentors");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// -------------------------------------- COURSE -------------------------------

// Adding a new course - GET
exports.getAddCourse = (req, res, next) => {
  Mentor.find()
    .then((mentorList) => {
      res.render("admin/edit-course", {
        pageTitle: "Add Course",
        path: "/courses",
        editing: false,
        isAuthenticated: req.session.isLoggedIn,
        hasErrors: false,
        errorMessage: null,
        validationErrors: [],
        mentors: mentorList,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Adding a new course - POST
exports.postAddCourse = (req, res, next) => {
  const name = req.body.name;
  const price = req.body.price;
  const description = req.body.description;
  const mentorId = req.body.mentorId;
  console.log(mentorId);
  const errors = validationResult(req);
  console.log(errors.array());

  Mentor.find()
    .then((mentors) => {
      if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-course", {
          pageTitle: "Course-error",
          path: "/admin/add-course",
          editing: false,
          hasErrors: true,
          errorMessage: errors.array()[0].msg,
          course: {
            name: name,
            price: price,
            description: description,
            mentors: mentors,
          },
          isAuthenticated: req.session.isLoggedIn,
          validationErrors: errors.array(),
          mentors: mentors,
        });
      }

      const newCourse = new Course({
        name: name,
        price: price,
        description: description,
        mentorId: mentorId,
      });

      return newCourse.save().then((result) => {
        console.log("New Course Added Successfully");
        res.redirect("/courses");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Edit Course - GET
exports.getEditCourse = (req, res, next) => {
  const editMode = req.query.edit;
  console.log("Edit: " + editMode);
  if (!editMode) {
    return res.redirect("/");
  } else {
    // Retrive the product
    const courseId = req.params.courseId;
    Course.findById(courseId)
      .then((course) => {
        if (!course) {
          res.redirect("/"); // Redirect if no mentor found
        } else {
          Mentor.find().then((mentors) => {
            res.render("admin/edit-course", {
              pageTitle: "Edit Course",
              path: "/admin/edit-course",
              editing: true,
              course: course,
              isAuthenticated: req.session.isLoggedIn,
              hasErrors: false,
              errorMessage: null,
              validationErrors: [],
              mentors: mentors,
              course: course,
            });
          });
        }
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  }
};

// Edit a Mentor - POST
exports.postEditCourse = (req, res, next) => {
  const courseId = req.body.courseId;
  const updatedName = req.body.name;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  const updatedMentorId = req.body.mentorId;
  const errors = validationResult(req);

  console.log(errors.array());

  Course.findById(courseId)
    .then((course) => {
      course;
      if (!req.session.isAdmin) {
        return res.redirect("/");
      }

      Mentor.find().then((mentors) => {
        if (!errors.isEmpty()) {
          return res.status(422).render("admin/edit-course", {
            pageTitle: "Edit Course",
            path: "/admin/edit-course",
            editing: true,
            hasErrors: true,
            errorMessage: errors.array()[0].msg,
            course: {
              name: updatedName,
              price: updatedPrice,
              description: updatedDescription,
              _id: courseId,
              mentorId: updatedMentorId,
            },
            isAuthenticated: req.session.isLoggedIn,
            validationErrors: errors.array(),
            mentors: mentors,
          });
        } else {
          course.name = updatedName;
          course.price = updatedPrice;
          course.description = updatedDescription;
          course.MentorId = updatedMentorId;

          return course.save().then((result) => {
            console.log("COURSE UPDATED SUCCESSFULLY!!");
            res.redirect("/courses");
          });
        }
      });
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};



// Delete a Course - POST
exports.deleteCourse = (req, res, next) => {
  const courseId = req.body.courseId;
  console.log("delete function " + courseId);
  Course.findById(courseId)
    .then((course) => {
      console.log("course : " + course);
      if (!course) {
        return next(new Error("Course not found"));
      }

      return Course.findByIdAndRemove({ _id: courseId });
    })
    .then((result) => {
      return User.updateMany(
        {},
        {
          $pull: {
            "enrollments.items": { courseId: courseId },
          },
        }
      );
    })
    .then((result) => {
      //req.flash("info", "Course Deleted Successfully");
      console.log("Course Deleted");
      res.redirect("/courses");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// ---------------------------------------  USERS ---------------------------

// Get List of Users
exports.getUsers = (req, res, next) => {
  const page = +req.query.page || 1
  User.find()
  .countDocuments()
  .then(total => {
    totalItems = total
    return User.find()
      .skip((page-1) * USERS_PER_PAGE)
      .limit(USERS_PER_PAGE)
  })
    .then((userList) => {
      res.render("admin/users", {
        pageTitle: "Users",
        path: "/admin/users",
        users: userList,
        currentPage: page,
        hasNextPage: (USERS_PER_PAGE * page) < totalItems,
        hasPrevPage: page > 1,
        nextPage: page+1,
        prevPage: page-1,
        lastPage: Math.ceil(totalItems/USERS_PER_PAGE)
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: "Failed to fetch users",
      });
    });
};

// Delete a User - POST
exports.deleteUser = (req, res, next) => {
  const userId = req.body.userId;
  User.findById(userId)
    .then((user) => {
      //console.log("course : " + course);
      if (!user) {
        return next(new Error("User not found"));
      }

      return User.findByIdAndRemove({ _id: userId });
    })
    .then((result) => {
      //req.flash("info", "Course Deleted Successfully");
      console.log("User Deleted");
      res.redirect("/admin/users");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
