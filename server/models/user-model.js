const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  username: {
    type: String,
    minlength: 3,
    maxlength: 50,
    required: true,
  },
  email: {
    type: String,
    minlength: 6,
    maxlength: 50,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "instructor"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
// instance methods
UserSchema.methods.isStudent = function () {
  return this.role == "student";
};

UserSchema.methods.isInstructor = function () {
  return this.role == "instructor";
};

UserSchema.methods.comparePassword = async function (password, cb) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    return cb(null, result);
  } catch (err) {
    return cb(err, result);
  }
};

// middleware

UserSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    let hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
