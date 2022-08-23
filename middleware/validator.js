const { check, body } = require("express-validator");
const User = require("../models/user");
const Mentor = require("../models/mentor");

exports.signupValidator = [
  body("name", "All fields are mandatory. Please provide valid data.")
    .not()
    .isEmpty(),
  body("email", "All fields are mandatory. Please provide valid data.")
    .not()
    .isEmpty(),
  body("password", "All fields are mandatory. Please provide valid data.")
    .not()
    .isEmpty(),
  body(
    "confirmPassword",
    "All fields are mandatory. Please provide valid data."
  )
    .not()
    .isEmpty(),
  body("name", "Name should contain atleast 3 characters")
    .isLength({ min: 3 })
    .isAlpha()
    .trim(),
  check("email")
    .isEmail()
    .withMessage("Please enter valid email")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject(
            "Email already exists. Please use a different email"
          );
        }
      });
    })
    .normalizeEmail(),
  body(
    "password",
    "Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 , max 20 char long"
  )
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
    .trim(),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Entered passwords do not match");
      }
      return true;
    })
    .trim(),
  (req, res, next) => {
    next();
  },
];

exports.loginValidator = [
  body("email", "All fields are mandatory. Please provide valid data.")
    .not()
    .isEmpty(),
  body("password", "All fields are mandatory. Please provide valid data.")
    .not()
    .isEmpty(),
  check("email").isEmail().withMessage("Please enter a valid Email").trim(),
  body("password", "Invalid email or password")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
    .trim(),
  (req, res, next) => {
    next();
  },
];

exports.mentorValidator = [
  body("name", "All fields are mandatory. Please provide valid data.")
    .not()
    .isEmpty(),
  body("email", "All fields are mandatory. Please provide valid data.")
    .not()
    .isEmpty(),
  body("contact", "All fields are mandatory. Please provide valid data.")
    .not()
    .isEmpty(),
  body("name", "Name should contain atleast 3 characters")
    .isLength({ min: 3 })
    .isAlpha()
    .trim(),
  check("email")
    .isEmail()
    .withMessage("Please enter valid email")
    .custom((value, { req }) => {
      return Mentor.findOne({ email: value }).then((mentor) => {
        if (mentor) {
          return Promise.reject(
            "Email already exists. Please use a different email"
          );
        }
      });
    })
    .normalizeEmail(),
  check("contact", "Please enter valid contact details")
    .trim()
    .isLength({ min: 10, max: 10 })
    .isNumeric()
    .custom((value, { req }) => {
      return Mentor.findOne({ contact: value }).then((mentor) => {
        if (mentor) {
          return Promise.reject(
            "Entered contact details are already registered for a different user.Please enter different contact details"
          );
        }
      });
    }),
];

exports.mentorUpdateValidator = [
  body("name", "All fields are mandatory. Please provide valid data.")
    .not()
    .isEmpty(),
  body("email", "All fields are mandatory. Please provide valid data.")
    .not()
    .isEmpty(),
  body("contact", "All fields are mandatory. Please provide valid data.")
    .not()
    .isEmpty(),
  body("name", "Name should contain atleast 3 characters")
    .isLength({ min: 3 })
    .isAlpha()
    .trim(),
  check("email")
    .isEmail()
    .withMessage("Please enter valid email")
    .normalizeEmail(),
  check("contact", "Please enter valid contact details")
    .trim()
    .isLength({ min: 10, max: 10 })
    .isNumeric(),
];

exports.courseValidator = [
  
  body("name", "All fields are mandatory. Please provide valid data.")
    .not()
    .isEmpty(),
  body("price", "All fields are mandatory. Please provide valid data.")
    .not()
    .isEmpty(),
  body("description", "All fields are mandatory. Please provide valid data.")
    .not()
    .isEmpty(),
  body("name", "Name should contain atleast 3 characters")
    .isLength({ min:3}),
  body("price", "Please enter valid amount")
    .isNumeric()
    .isInt({ min: 0, max: 2000 }),
  body("description", "Descirption should atleast be 10 characters").isLength({
    min: 10,
  }),
  (req, res, next) => {
    next();
  },
];
