const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

require("dotenv").config();

const User = require("../models/user");

// GET Signup
exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    errorMessage: message,
    oldInput: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

// GET postLogin
exports.getLogin = (req, res, next) => {

  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: null,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

// Signup a new user
exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  console.log(errors.array())
  

  // Validation errors
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Signup",
      path: "/signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        name: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  // Password Hashing using bcrypt
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const newUser = new User({
        name: name,
        email: email,
        password: hashedPassword,
        enrollments: { items: [] },
      });

      return newUser.save();
    })
    .then((result) => {
      console.log("User Created Successfully");
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        message: "User creation failed",
        error: err,
      });
    });
};

// User Login
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      errorMessage: errors.array()[0].msg,
      infoMessage: null,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          path: "/login",
          errorMessage: "Invalid email or password",
          infoMessage: null,
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [],
        });
      }
      bcrypt.compare(password, user.password).then((matched) => {
        if (matched) {
          // Credentials matched
          let isAdmin = user.isAdmin;
          req.session.isAdmin = isAdmin;
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save((err) => {
            console.log(err);
            console.log("--- LOGIN SUCCESSFULL ---");
            res.redirect("/");
          });
        }
        // Failed Login
        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          path: "/login",
          errorMessage: "Invalid credentials. Please try again.",
          infoMessage: null,
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [],
        });
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// LOGOUT
exports.getLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
