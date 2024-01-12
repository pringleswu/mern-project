const mongoose = require("mongoose");
const { Schema } = mongoose;

const CourseSchema = new Schema({
  id: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId, // primary key
    ref: "User", //
  },
  students: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Course", CourseSchema);
