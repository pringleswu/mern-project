const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// const { auth } = require("./routes").auth;
// const { course } = require("./routes").course;
dotenv.config();
const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;
const passport = require("passport");
require("./config/passport")(passport); //直接執行passport套件
const cors = require("cors");

mongoose.connect("mongodb://127.0.0.1:27017/mernDB").then(() => {
  console.log("已成功連結上MongoDB...");
});

// middlewa
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/user", authRoute); //任何有關於User API 都連到auth
app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }),
  courseRoute
); //任何有關於Course API

app.get("/", (req, res) => {
  res.send("後端伺服器首頁");
});

app.listen(8080, () => {
  console.log("後端伺服器聽在PORT 8080....");
});
