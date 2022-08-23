const mongoose = require("mongoose");

const Course = require('../models/course')

const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    enrollments: {
      items: [
        {
          courseId: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: false,
          },
        },
      ],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.methods.addEnrollment = function (course) {

  const updatedEnrollmentItems = [...this.enrollments.items];

    // Add Course to Enrollments
    updatedEnrollmentItems.push({
      courseId: course._id
    });

    const updatedEnrollments = {
      items: updatedEnrollmentItems,
    };

    this.enrollments = updatedEnrollments;

  
  return this.save();
};

userSchema.methods.getEnrollments = function (enrol) {
  const courses = enrol
    .filter((i) => {
      return i.courseId !== null;
    })
    .map((el) => {
      if (el.courseId !== null) {
        //console.log("el.productId : ", el.productId);
        Course.findById(el.courseId._id)
          .then((result) => {
            if (!result) {
              this.delete(el);
            }
          })
          .catch((err) => {
            console.log(err);
          });
        //console.log("Returned from el : ", el);
        return el;
      }
      // } else {
      //   this.delete(el);
      //   return null;
      // }
    });
  //console.log("func: ", products);
  return courses;
};

module.exports = mongoose.model("User", userSchema);
