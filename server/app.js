import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import fs from "fs";

import User from "./model/User";

const app = express();
const port = process.env.PORT || 8080;

const storage = multer.diskStorage({
    destination: "./server/files/",
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
}).single("myFile");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

mongoose.connect("mongodb://localhost:27017/zulfikri-test", {useNewUrlParser: true});
mongoose.connection.on("connected", () => console.log("Database connected."));
mongoose.connection.on("error", () => console.log("Error connecting to database."));

app.get("/check-user/:username", (req, res) => {
  const {username} = req.params;
    User.find({username}, (err, user) => {
      if(user.length) {
        res.json({isExist: true});
      } else {
        res.json({isExist: false});
      }
    });
});

app.get("/:username/files", (req, res) => {
  const {username} = req.params;
  User.findOne({username}).select("files").exec((err, user) => {
    res.json({data: user});
  });
});

app.get("/download/:filename(*)", (req, res) => {
  const {filename} = req.params;
  const fileLocation = path.join(__dirname, "files", filename);

  console.log("Downloading from " + fileLocation);
  res.download(fileLocation, filename, err => {
    if(err) {
      return console.log(err);
    }
  });
});

app.get("/new-user/:username", (req, res) => {
    const {username} = req.params;

    User.findOne({username}, (err, user) => {
        if(err) {
          return res.json({error: err});
        }
        if(user) {
            return res.json({message: "User already exist"});
        }
        const newUser = User({username});
        newUser.save(err => {
          if(err) {
            return res.json({error: err})
          }
          return res.json({message: "New user created"});
        });

    });
});

app.post("/upload/:username", (req, res) => {
    upload(req, res, (err) => {
    if(!err) {
        const {username} = req.params;

        User.findOne({username: username}, (err, user) => {
            if(err) {
                return console.log("User not found.")
            }
            user.files.push({filename: req.file.originalname});
            user.save((err) => {
              res.json({status: "Success"});
            });
        });
    }
    else {
        res.json({status: "Failed"});
    }
    });
});

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
