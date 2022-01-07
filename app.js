//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

// const encrypt = require("mongoose-encryption");

// const md5 = require("md5");

// const bcrypt = require("bcrypt");
// const saltRound = 10;

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
        secret: "our litte secret.",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

// const userSchema = {
//     email: String,
//     password: String,
// };

// Changing to perform encryption
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

userSchema.plugin(passportLocalMongoose);

// const secret = "Thisisourlittlesecret.";
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });
// userSchema.plugin(encrypt, {
//     secret: process.env.SECRET,
//     encryptedFields: ["password"],
// });

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.route("/").get(function (req, res) {
    res.render("home");
});

app.route("/login")
    .get(function (req, res) {
        res.render("login");
    })
    .post(function (req, res) {
        /* Using Passport */
        const user = new User({
            username: req.body.username,
            passport: req.body.password,
        });

        req.login(user, function (err) {
            if (err) {
                console.log(err);
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/secrets");
                });
            }
        });

        /* Using Bcrypt */
        // const username = req.body.username;
        // const password = req.body.password;
        // User.findOne({ email: username }, function (err, foundUser) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         if (foundUser) {
        //             // if (foundUser.password === password) {
        //             //     res.render("secrets");
        //             // } else {
        //             //     console.log("Password incorrect");
        //             // }
        //             bcrypt.compare(
        //                 password,
        //                 foundUser.password,
        //                 function (err, result) {
        //                     if (result === true) {
        //                         res.render("secrets");
        //                     } else {
        //                         console.log("Password incorrect");
        //                     }
        //                 }
        //             );
        //         } else {
        //             console.log("Not found");
        //         }
        //     }
        // });
    });

app.route("/register")
    .get(function (req, res) {
        res.render("register");
    })
    .post(function (req, res) {
        /* Using Passport */
        User.register(
            { username: req.body.username },
            req.body.password,
            function (err, user) {
                if (err) {
                    console.log(err);
                    res.redirect("/register");
                } else {
                    passport.authenticate("local")(req, res, function () {
                        res.redirect("/secrets");
                    });
                }
            }
        );

        /* Using Bcrypt */
        // bcrypt.hash(req.body.password, saltRound, function (err, hash) {
        //     const newUser = new User({
        //         email: req.body.username,
        //         password: hash,
        //     });
        //     // console.log(req.body.username);
        //     // console.log(req.body.password);
        //     // console.log(newUser);
        //     newUser.save(function (err) {
        //         if (!err) {
        //             // console.log(newUser);
        //             res.render("secrets");
        //         } else {
        //             console.log(err);
        //         }
        //     });
        // });
    });

app.route("/secrets").get(function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.route("/logout").get(function (req, res) {
    req.logout();
    res.redirect("/");
});

app.listen(3000, function () {
    console.log("server is running on port 3000");
});
