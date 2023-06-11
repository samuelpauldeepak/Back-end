//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();
const methodOverride = require("method-override");

const Note =
  "This Blog Website is under the Surveillance of Sir Theagaraya College, P.G Department of Computer Science and Application. So Dont Try to post or Delete the Any Information Without Department Head Concern.";

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));
mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(console.log("connection Succeeded in MongoDB"))
  .catch((err) => {
    console.log(err);
  });

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    postType: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("post", postSchema);

const loginSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});
const User = mongoose.model("user", loginSchema);

let posts = [];

app.get("/", function (req, res) {
  Post.find({}, function (err, posts) {
    res.render("message", { Content: Note, postData: posts });
  });
});

app.get("/home", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login", { msg: "Enter Email and password" });
});

app.get("/contact", function (req, res) {
  res.render("contact");
});

app.post("/login", function (req, res) {
  User.findOne({ userName: req.body.userName }, function (err, post) {
    if (post) {
      if (post.userName === req.body.userName) {
        if (post.password === req.body.password) {
          res.render("compose");
        } else {
          res.render("login", { msg: "Incorrect Password" });
        }
      } else {
        res.render("login", { msg: "Incorrect Email" });
      }
    } else {
      res.render("login", { msg: "unauthorized user" });
    }
  });
});

app.post("/compose", function (req, res) {
  postTitle = req.body.postTitle;
  postBody = req.body.postBody;
  Type = req.body.postType;

  const post = new Post({
    title: postTitle,
    content: postBody,
    postType: Type,
  });
  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.post("/register", function (req, res) {
  username = req.body.userName;
  password = req.body.password;

  const user = new User({
    userName: username,
    password: password,
  });

  user.save(function (err) {
    if (!err) {
      res.status(200).send("successfully user created");
      // res.redirect("/");
    }
  });
  // user
  //   .save()
  //   .then(res.status(200).send("successfully user created"))
  //   .catch((err) => res.status(400).send(err));
});
// ##################################################################################################################
let idRoute;
app.delete("/delete/:route", function (req, res) {
  idRoute = req.params.route;
  res.render("loginDelete", { msg: "Enter Email and password" });
});

app.get("/loginDelete", function (req, res) {
  console.log(idRoute);
  res.render("loginDelete", { msg: "Enter Email and password" });
});

app.post("/loginDelete", function (req, res) {
  User.findOne({ userName: req.body.userName }, function (err, post) {
    if (post) {
      if (post.userName === req.body.userName) {
        if (post.password === req.body.password) {
          Post.deleteOne({ _id: idRoute }, function (err) {
            res.redirect("/");
          });
        } else {
          res.render("login", { msg: "Incorrect Password " });
        }
      } else {
        res.render("login", { msg: "Incorrect Email" });
      }
    } else {
      res.render("login", { msg: "unauthorized user" });
    }
  });
});

app.get("/post/:route", function (req, res) {
  const id = req.params.route;
  Post.findOne({ _id: id }, function (err, post) {
    res.render("post", {
      Title: post.title,
      Content: post.content,
      time: post.createdAt,
      type: post.postType,
      id: post._id,
    });
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
