const Mentor = require("../models/mentor");
const validator = require("./validator");

module.exports = (req, res, next) => {
  Mentor.findById(mentorId)
    .then((mentor) => {
      if (!req.session.isAdmin) {
        return res.redirect("/");
      }

      if (mentor.email !== req.body.email) {
        // No validation for email
        console.log("usual");
        next(validator.mentorValidator);
      } else {
        console.log("skip mail");
        next(validator.mentorUpdateValidator);
      }
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  // if(!req.session.isAdmin) {
  //     return res.redirect('/401');
  // }
  // next();
};
