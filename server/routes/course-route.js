const router = require("express").Router();
const Course = require("../models").Course;
const courseValidation = require("../validation").courseValidation;
const User = require("../models").User;

router.use((req, res, next) => {
  console.log("course route 正在接受一個request .....");
  next();
});
//列出所有課程
router.get("/", async (req, res) => {
  try {
    let courseFound = await Course.find()
      .populate("instructor", ["username", "email"])
      .exec();
    res.send(courseFound);
  } catch (e) {
    res.status(500).send(e);
  }
});
//用ID 尋找課程
router.get("/:_id", async (req, res) => {
  try {
    let { _id } = req.params;
    let courseFound = await Course.findOne({ _id })
      .populate("instructor", ["username", "email"])
      .exec();
    res.send(courseFound);
  } catch (e) {
    res.status(500).send(e);
  }
});
//輸入課程名稱 尋找課程
router.get("/findByName/:name", async (req, res) => {
  try {
    let { name } = req.params;
    let courseFound = await Course.find({ title: name })
      .populate("instructor", ["username", "email"])
      .exec();
    res.send(courseFound);
  } catch (e) {
    res.status(500).send(e);
  }
});
// 用學生ID 尋找課程
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  let coursesFound = await Course.find({ students: _student_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(coursesFound);
});

//用課程ID 註冊課程
router.post("/enroll/:_id", async (req, res) => {
  try {
    let { _id } = req.params; //需要用{}
    let courseFound = await Course.findOne({ _id }).exec();
    courseFound.students.push(req.user._id);
    console.log(courseFound);
    await courseFound.save();
    res.send("註冊完成");
  } catch (e) {
    res.send(e);
  }
});

//用講師ID 尋找課程
router.get("/instructor/:_instructor_id", async (req, res) => {
  try {
    let { _instructor_id } = req.params; //需要用{}
    let courseFound = await Course.find({ instructor: _instructor_id })
      .populate("instructor", ["username", "email"])
      .exec();
    res.send(courseFound);
  } catch (e) {
    res.status(500).send(e);
  }
});

//新增課程
router.post("/", async (req, res) => {
  let { error } = courseValidation(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
  }
  if (req.user.isStudent()) {
    console.log(req.user.isStudent());
    return res.status(400).send("只有講師帳號能新增課程");
  }
  let { title, description, price } = req.body;
  console.log(req.user);
  try {
    let newCourse = new Course({
      title,
      description,
      price,
      instructor: req.user._id,
    });
    console.log(newCourse);
    let savedCourse = await newCourse.save();
    console.log(savedCourse);
    return res.send({ message: "課程已經創建", savedCourse });
  } catch (e) {
    res.status(500).send("無法創建課程");
  }
});

router.patch("/:_id", async (req, res) => {
  // 課程是否符合規範
  let { error } = courseValidation(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
  }
  let { _id } = req.params;
  //檢查課程是否存在
  try {
    let courseFound = await Course.findOne({ _id }).exec();
    console.log(courseFound);
    if (!courseFound) {
      res.status(400).send("找不到此ID課程....");
    }
    //驗證講師身分
    if (courseFound.instructor.equals(req.user._id)) {
      let updatedCourse = await Course.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      }).populate("instructor", ["username"]);
      res.send({ message: "課程更新完成", updatedCourse });
    } else {
      res.status(403).send("只有此課程講師才能編輯課程...");
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

// 刪除課程
router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id }).exec();
    console.log(courseFound);
    if (!courseFound) {
      res.status(400).send("找不到此ID課程....");
    }
    //驗證講師身分
    if (courseFound.instructor.equals(req.user._id)) {
      await Course.findOneAndDelete({ _id }).exec();
      res.send("課程刪除完成");
    } else {
      res.status(403).send("只有此課程講師才能刪除課程...");
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
