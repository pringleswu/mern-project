const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models").User;
const jwt = require("jsonwebtoken");

router.use((req, res, next) => {
  console.log("正在接收一個跟auth相關請求");
  next();
});

router.get("/testAPI", (req, res) => {
  return res.send("正在連結Auth Route");
});

router.post("/register", async (req, res) => {
  //確認數據是否符合規定
  let { error } = registerValidation(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
  }
  //確認信箱是否註冊過
  let emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) {
    res.status(400).send("email已經註冊過.....");
  }
  //儲存新用戶

  let { username, email, password, role } = req.body;
  let newUser = new User({ username, email, password, role });
  console.log(newUser);
  try {
    let savedUser = await newUser.save();

    console.log(savedUser);
    return res.send({ msg: "儲存新用戶成功", savedUser: savedUser });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/login", async (req, res) => {
  //驗證email 和 password 是否符合規範
  let { error } = loginValidation(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
  }
  // 驗證email是否有註冊過
  let foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) {
    res.status(400).send("此email沒有註冊過, 請先註冊");
  }
  //比對Password, 正確後產生一個token
  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) return res.status(500).send(err);

    //製作一個token
    if (isMatch) {
      const tokenObject = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      return res.send({
        message: "成功登入",
        token: "JWT " + token, //"JWT "後要有space
        user: foundUser,
      });
    } else {
      return res.status(401).send("密碼錯誤");
    }
  });
});

module.exports = router;
